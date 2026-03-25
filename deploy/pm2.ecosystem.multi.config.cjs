module.exports = {
  apps: [
    {
      name: "redoxy-erp-ksa-api",
      cwd: "/var/www/redoxy-erp-ksa",
      script: "server/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env_file: "/var/www/redoxy-erp-ksa/.env",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "redoxy-erp-uae-api",
      cwd: "/var/www/redoxy-erp-uae",
      script: "server/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env_file: "/var/www/redoxy-erp-uae/.env",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
