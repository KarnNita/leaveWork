module.exports = {
  future: { v2_routeConvention: true },
  ignoredRouteFiles: ['**/.*'],
  serverModuleFormat: 'esm',
  serverBuildTarget: 'netlify',  // กำหนดเป้าหมายการสร้าง build สำหรับ Netlify
  server: './server.js',         // ฟังก์ชัน server จะต้องไปที่ไฟล์ server.js
};
