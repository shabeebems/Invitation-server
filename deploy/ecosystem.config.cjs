const APP_ROOT = "/var/www/invitation-api";

module.exports = {
  apps: [
    {
      name: "invitation-api",
      // Paths go through the `current` symlink so a restart always runs the active release.
      script: `${APP_ROOT}/current/dist/server.js`,
      cwd: `${APP_ROOT}/current`,
      env: { NODE_ENV: "production" },
      max_memory_restart: "400M",
      time: true,
    },
  ],
};
