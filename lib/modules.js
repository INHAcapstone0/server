const bcrypt=require('bcrypt')

module.exports = {
  toDate: (str) => {
    var dt = str.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '$1-$2-$3 $4:$5:$6');
    var _datetime = new Date(dt);
    return _datetime;
  },
  isValidDate:(d) =>{
    return d instanceof Date && !isNaN(d);
  },
  isValidPassword:(password)=>{
    var checkPassword = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[$@!%*#?&])[a-z0-9$@!%*#?&]{8,}$");
    return checkPassword.test(password);
  },
  hashPassword:async (password)=>{
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt)
    return password;
  }
}