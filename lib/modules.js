
module.exports = {
  toDate: (str) => {
    var dt = str.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$1-$2-$3 $4:$5:$6');
    var _datetime = new Date(dt);
    return _datetime;
  },
  isValidDate:(d) =>{
    return d instanceof Date && !isNaN(d);
  }
}