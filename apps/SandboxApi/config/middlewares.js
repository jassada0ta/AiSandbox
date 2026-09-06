module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  {
    // Must stay directly above `strapi::public` so the rewritten path is
    // picked up by the static file server.
    name: 'global::spa-fallback',
    config: {
      mountPath: '/app',
    },
  },
  'strapi::public',
];
