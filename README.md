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


- docker rm [컨테이너명] -f(forced) : 특정 container 삭제 (f옵션 : running 중인 컨테이너 포함 모두 삭제 )
- docker rmi [image name or id] -f(forced) : 특정 docker 이미지 삭제 (f옵션 : 이미지를 사용하는 모든 컨테이너 종료)
- docker ps -a(all existing container) : 모든 docker container 출력 (a옵션 : 작동이 중지된 컨테이너도 보여줌)
- docker images (or docker image ls) : 모든 docker 이미지 출력
- docker-compose up -d(detatch) --build(forced-build) : docker 컴포즈(백그라운드 실행, 이미지 다시 빌드)
- docker-compose down -v(volume delete not nessesary) : docker 디컴포즈(만들어진 볼륨 모두 삭제) -> 만들어진 container 모두 삭제
- docker-compose -f [docker-compose yml file] -f [docker-compose yml file]
- docker volume prune : 필요 없는 volume 모두 삭제
- docker images prune : 필요 없는 image 모두 삭제
- docker inspect [container] : container 정보 조회
- docker network ls : docker 네트워크 정보 조회
- docker compose의 service name을 dns처럼 사용할 수 있음`
- depends_on 옵션 : 종속성을 나타내고 container run 순서를 변경 가능