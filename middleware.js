
// ghi log thong tin request
const logger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
}

//kiem tra URL
const validateUrl = (req, res, next) => {
    if (req.path === '/create') {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({ error: 'URL para is required'});
        }

        try {
            // kiem tra URL co hop le khong
            new URL(url);
            next();
        } catch (error) {
            return res.status(400).json({error: 'invalid url format'});
        }
    } else {
        next();
    }
}

const errorHandler = (err, req, res, next) => {
    console.error('Error', err);
    res.status(500).json({ error: 'Internal server error'});
};

const notFound = (req, res) => {
    res.status(404).json({ error : 'route not found'});
};

module.exports = {
    logger, validateUrl, errorHandler, notFound
};