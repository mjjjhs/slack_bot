# slack-bot
사내 생일 및 입사 축하 슬랙봇 토이프로젝트    
슬랙의 APP 생성 후 해당 APP의 웹훅을 이용한 채널에 멘션 + 이모지 + 이미지로 이루어진 메시지 전송

# slack credentials
private한 내용의 credentials.json (슬랙의 토큰 정보) 은 따로 관리   
slack 및 google sheet API 관련 값들은 .env.dev로 따로 관리
# npm script
### dev

  * 빌드하지 않고 ts파일을 직접 nodemon으로 실행 (watching)
  
### start

  * dist에 빌드된 파일을 ts-node를 이용하여 실행

### build
  
  * 빌드 폴더 dist를 삭제 후 다시 빌드
  
### build:clean

  * 빌드 폴더 삭제
  
### development 

  * pm2-runtime 을 이용한 서버 실행
  
### eb:dev
  
  * aws elastic beanstalk를 위한 script

# 슬랙 메시지 화면
<img width="500" alt="슬랙화면" src="https://user-images.githubusercontent.com/4207593/100060931-a1298600-2e70-11eb-9cbd-96a1d2f2c153.png"></img>
