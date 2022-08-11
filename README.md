초기 세팅
>> .env파일 메인단에 추가
>> mysql
grant all privileges on *.* to root@localhost;
flush privileges;

테스트 환경 시작 시 cross-env NODE_ENV=test

heroku에서 migration 작업 진행 시 앞에 heroku run 붙이기
npx sequelize-cli db:migrate  //migrate
npx sequelize-cli db:migrate:undo:all  //undo migrate
npx sequelize-cli db:seed:all // 모든 seed 실행
npx sequelize-cli db:seed:all --debug // Debuggingd을 포함해서 모든 seed 실행
npx sequelize-cli db:seed:undo // undo seeder
npx sequelize-cli seed:generate --name 파일명 // 새로운 seeder 생성



heroku logs --tail //debugging
git push heroku master // heroku push
heroku config | grep CLEARDB_DATABASE_URL // clearDB URI 가져오기
heroku-dotenv push // .env파일 heroku에 push

redis-server // redis 구동
redis-cli // redis cli open