module.exports = {
  apps: [
    {
      name: "redoxy-erp-api",
      cwd: "/var/www/redoxy-erp",
      script: "server/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env_file: "/var/www/redoxy-erp/.env",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
