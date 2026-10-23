const os = require('os');
const v8 = require('v8');

// @desc    Inspect Node.js Architecture, V8 Engine, Event Loop, and Global Objects
// @route   GET /api/internals/system
// @access  Public
exports.getSystemInternals = (req, res) => {
  const memory = process.memoryUsage();
  const heapStats = v8.getHeapStatistics();

  res.status(200).json({
    success: true,
    title: 'Node.js Internals & Architecture Inspection (Topics 31 & 32)',
    v8Engine: {
      v8Version: process.versions.v8,
      nodeVersion: process.version,
      libuvVersion: process.versions.uv,
      architecture: process.arch,
      platform: process.platform
    },
    processAndGlobals: {
      pid: process.pid,
      uptimeSeconds: Math.floor(process.uptime()),
      cwd: process.cwd(),
      globalObjectsPresent: ['global', 'process', 'Buffer', '__dirname', '__filename', 'setImmediate', 'clearImmediate']
    },
    eventLoopMetrics: {
      type: 'libuv Event Loop (Single-threaded Non-blocking I/O)',
      phases: [
        'timers (setTimeout, setInterval)',
        'pending callbacks (I/O callbacks)',
        'idle, prepare',
        'poll (retrieve new I/O events)',
        'check (setImmediate)',
        'close callbacks (e.g. socket.on("close"))'
      ],
      microtasks: 'process.nextTick() and Promise microtask queue run after each phase'
    },
    memoryUsageMB: {
      rss: +(memory.rss / 1024 / 1024).toFixed(2),
      heapTotal: +(memory.heapTotal / 1024 / 1024).toFixed(2),
      heapUsed: +(memory.heapUsed / 1024 / 1024).toFixed(2),
      external: +(memory.external / 1024 / 1024).toFixed(2)
    },
    v8HeapStatisticsMB: {
      totalHeapSize: +(heapStats.total_heap_size / 1024 / 1024).toFixed(2),
      usedHeapSize: +(heapStats.used_heap_size / 1024 / 1024).toFixed(2),
      heapSizeLimit: +(heapStats.heap_size_limit / 1024 / 1024).toFixed(2)
    },
    hardware: {
      cpuModel: os.cpus()[0] ? os.cpus()[0].model : 'Unknown',
      cpuCores: os.cpus().length,
      totalMemoryGB: +(os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
      freeMemoryGB: +(os.freemem() / 1024 / 1024 / 1024).toFixed(2)
    }
  });
};

// @desc    Live demonstration comparing Callbacks vs Promises vs Async/Await
// @route   GET /api/internals/async-demo
// @access  Public
exports.getAsyncDemo = async (req, res) => {
  const simulateAsyncOperation = (label, delayMs) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ step: label, completedInMs: delayMs });
      }, delayMs);
    });
  };

  const startTime = Date.now();

  const step1 = await simulateAsyncOperation('1. Query User in MongoDB', 15);
  const step2 = await simulateAsyncOperation('2. Verify Slot Availability in Mongoose', 15);
  const step3 = await simulateAsyncOperation('3. Emit Audit Event via EventEmitter', 10);

  const totalTime = Date.now() - startTime;

  res.status(200).json({
    success: true,
    topic: 'Asynchronous JavaScript: Callbacks, Promises, & Async/Await (Topics 27-28)',
    summary: 'Demonstrates non-blocking execution resolved sequentially with Async/Await & microtasks.',
    executionPipeline: [step1, step2, step3],
    totalDurationMs: totalTime,
    codeExamples: {
      callbacksPattern: 'db.find(query, function(err, result) { if (err) handle(); process(result); });',
      promisesPattern: 'db.find(query).then(result => process(result)).catch(err => handle(err));',
      asyncAwaitPattern: 'try { const result = await db.find(query); process(result); } catch (err) { handle(err); }'
    }
  });
};
