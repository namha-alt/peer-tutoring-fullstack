// In-memory traffic log buffer for live demonstration
const recentLogs = [];
const MAX_LOGS = 60;

const logApiTraffic = (req, res, next) => {
  // Only intercept API calls
  if (!req.path.startsWith('/api') || req.path === '/api/system/traffic') {
    return next();
  }

  const startTime = Date.now();
  const originalJson = res.json;

  // Intercept response to capture payload and duration
  let responseBody = null;
  res.json = function(body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const isSuccess = statusCode >= 200 && statusCode < 400;
    const statusIcon = isSuccess ? '🟢' : '🔴';

    const logEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      statusCode: statusCode,
      durationMs: duration,
      requestHeaders: {
        authorization: req.headers.authorization ? 'Bearer [HIDDEN_JWT]' : undefined,
        contentType: req.headers['content-type']
      },
      requestBody: req.body && Object.keys(req.body).length > 0 ? sanitizeBody(req.body) : null,
      responseBody: responseBody ? sanitizeResponse(responseBody) : null
    };

    // Store in recent logs
    recentLogs.unshift(logEntry);
    if (recentLogs.length > MAX_LOGS) {
      recentLogs.pop();
    }

    // Terminal colored output for live presentation
    const colorCode = isSuccess ? '\x1b[32m' : '\x1b[31m';
    const methodColor = '\x1b[36m';
    const reset = '\x1b[0m';
    console.log(
      `[API LIVE] ${statusIcon} ${methodColor}${req.method.padEnd(6)}${reset} ${req.originalUrl} - ${colorCode}${statusCode}${reset} (${duration}ms)`
    );
  });

  next();
};

function sanitizeBody(body) {
  const clone = { ...body };
  if (clone.password) clone.password = '••••••••';
  return clone;
}

function sanitizeResponse(resData) {
  if (typeof resData !== 'object' || resData === null) return resData;
  const clone = JSON.parse(JSON.stringify(resData));
  if (clone.token) clone.token = clone.token.substring(0, 15) + '...[JWT]';
  return clone;
}

const getTrafficLogs = () => recentLogs;

const clearTrafficLogs = () => {
  recentLogs.length = 0;
};

module.exports = { logApiTraffic, getTrafficLogs, clearTrafficLogs };
