const notFound = (req, res) => res.status(404).send('경로가 존재하지 않습니다.')

module.exports = notFound
