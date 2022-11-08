const bcrypt=require('bcrypt')

module.exports = {
  toDate_deprecated: (str) => {
    str=str+'000000'
    var dt = str.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$1-$2-$3 $4:$5:$6');
    var _datetime = new Date(dt);
    return _datetime;
  },
  toDate: (str) => {
    str=str+'00'
    var dt = str.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$1-$2-$3 $4:$5:$6');
    var _datetime = new Date(dt);
    return _datetime;
  },
  toFullDate: (str) => {
    var dt = str.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$1-$2-$3 $4:$5:$6');
    var _datetime = new Date(dt);
    return _datetime;
  },
  isValidDate:(d) =>{
    return d instanceof Date && !isNaN(d);
  },
  isValidPassword:(password)=>{
    var checkPassword = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[$@^!%*#?&])[a-z0-9$@^!%*#?&]{8,}$");
    return checkPassword.test(password);
  },
  hashPassword:async (password)=>{
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt)
    return password;
  },
  nowYYYYMMDDhhmmss: ()=> {
    function pad(n) { return n<10 ? "0"+n : n }
    let d=new Date()
    return d.getFullYear()+""+
    pad(d.getMonth()+1)+""+
    pad(d.getDate())+""+
    pad(d.getHours())+""+
    pad(d.getMinutes())+""+
    pad(d.getSeconds())
  },
  generateRandom9Code: ()=> {
    let str = ''
    for (let i = 0; i < 9; i++) {
      str += Math.floor(Math.random() * 10)
    }
    return str
  }
}