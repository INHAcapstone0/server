npx sequelize-cli db:migrate  //migrate
npx sequelize-cli db:migrate:undo  //undo migrate
npx sequelize-cli db:seed:all // 모든 seed 실행
npx sequelize-cli db:seed:all --debug // Debuggingd을 포함해서 모든 seed 실행
npx sequelize-cli db:seed:undo // undo seeder

npx sequelize-cli seed:generate --name 파일명 // 새로운 seeder 생성

