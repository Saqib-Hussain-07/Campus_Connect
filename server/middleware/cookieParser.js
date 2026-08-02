// Simple zero-dependency cookie parser middleware for Express
module.exports = (req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts.shift().trim();
      const value = decodeURIComponent(parts.join('='));
      if (name) req.cookies[name] = value;
    });
  }
  next();
};
