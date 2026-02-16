const axios = require('axios');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout
});

function prompt(question) {
   return new Promise((resolve) => rl.question(question, resolve));
}

async function sidiva(number) {
   try {
      if (!number) throw new Error('Number is required');

      let msisdn = number.replace(/\D/g, '');

      if (msisdn.startsWith('08')) {
         msisdn = '62' + msisdn.slice(1);
      } else if (msisdn.startsWith('8')) {
         msisdn = '62' + msisdn;
      } else if (!msisdn.startsWith('62')) {
         throw new Error('Format nomor tidak valid');
      }

      const secret = 'zhYqHrObvu62ZJOJeWADvp2a';
      const timestamp = Date.now() + 10000;

      const data = `${msisdn}.${timestamp}`;
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(data);
      const signature = hmac.digest('hex');

      const response = await axios.post(
         'https://sidompul.violetvpn.biz.id/api/sidompul',
         { msisdn, timestamp },
         {
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${signature}`
            }
         }
      );

      return { success: true, data: response.data.data };

   } catch (error) {
      return {
         success: false,
         message:
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch data'
      };
   }
}

async function cekKuotaXL() {
   const nomor = await prompt("Masukkan nomor XL: ");

   try {
      const response = await axios.get(
         `https://srg-txl-utility-service.ext.dp.xl.co.id/v5/package/v5.2/check/${nomor}`,
         {
            headers: {
               'user-agent': 'okhttp/3.12.1',
               'accept': 'application/json'
            }
         }
      );

      console.log("\nData Kuota XL:");
      console.log(JSON.stringify(response.data.result?.data, null, 2));

   } catch (error) {
      console.log(error.response?.data || error.message);
   }
}

async function cekSidiva() {
   const nomor = await prompt("Masukkan nomor untuk Sidiva: ");
   const result = await sidiva(nomor);

   if (result.success) {
      console.log("\nData Sidiva:");
      console.log(JSON.stringify(result.data, null, 2));
   } else {
      console.log(result.message);
   }
}

async function main() {
   while (true) {
      console.log("\n1. Cek Kuota XL");
      console.log("2. Cek Sidiva");
      console.log("3. Keluar");

      const choice = await prompt("Pilih: ");

      if (choice === '1') await cekKuotaXL();
      else if (choice === '2') await cekSidiva();
      else if (choice === '3') {
         rl.close();
         break;
      }
   }
}

main();
