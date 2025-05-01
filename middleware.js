
// ghi log thong tin request
export const logger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
}

//kiem tra URL
export const validateUrl = (req, res, next) => {
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

export const errorHandler = (err, req, res, next) => {
    console.error('Error', err);
    res.status(500).json({ error: 'Internal server error'});
};

export const notFound = (req, res) => {
    res.status(404).json({ error : 'route not found'});
};

export default {
    logger, validateUrl, errorHandler, notFound,
};