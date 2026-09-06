'use strict';

/**
 * SPA fallback for SandboxSpaApp, which is built into `public/app`.
 *
 * `strapi::public` (koa-static) can only serve files that exist on disk, so a
 * client-side route such as `/app/settings` would 404 on a hard refresh. This
 * middleware rewrites any non-asset GET under the mount point to the SPA's
 * `index.html` and lets the static middleware take it from there.
 *
 * It must be registered *before* `strapi::public` in `config/middlewares.js`.
 */
module.exports = (config = {}) => {
  const mountPath = config.mountPath || '/app';
  const indexPath = `${mountPath}/index.html`;

  return async (ctx, next) => {
    const isReadRequest = ctx.method === 'GET' || ctx.method === 'HEAD';
    const isUnderMount = ctx.path === mountPath || ctx.path.startsWith(`${mountPath}/`);

    if (isReadRequest && isUnderMount) {
      // Anything with a file extension is a real asset request (JS, CSS, images).
      const looksLikeAsset = /\.[^/]+$/.test(ctx.path);

      if (!looksLikeAsset) {
        ctx.path = indexPath;
      }
    }

    await next();
  };
};
