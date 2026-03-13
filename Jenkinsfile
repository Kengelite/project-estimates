pipeline {
    agent any

    environment {
        BUILD_TAG = "${env.BUILD_NUMBER}"
    }

    parameters {
        booleanParam(
            name: 'CLEAN_VOLUMES',
            defaultValue: false,
            description: 'เลือก True หากต้องการลบข้อมูลใน Database ทิ้งแล้วเริ่มใหม่'
        )
        string(
            name: 'API_HOST',
            defaultValue: 'http://10.198.110.26:3001',
            description: 'URL ของ API สำหรับให้ Frontend เรียกใช้'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    checkout scm
                    env.GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    echo "Build: ${BUILD_TAG}, Commit: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Prepare Environment') {
            steps {
                script {
                    echo "Creating .env file from Jenkins Credentials..."
                    // ต้องไปสร้าง Credentials ID: MYSQL_ROOT_PASSWORD ใน Jenkins ก่อนนะครับ
                    withCredentials([
                        string(credentialsId: 'MYSQL_ROOT_PASSWORD', variable: 'ROOT_PASS')
                    ]) {
                        writeFile file: '.env', text: """
MYSQL_ROOT_PASSWORD=${env.ROOT_PASS}
MYSQL_DATABASE=attractions_db
MYSQL_USER=user
MYSQL_PASSWORD=pass
API_PORT=3001
FRONTEND_PORT=3000
API_HOST=${params.API_HOST}
VITE_API_URL=${params.API_HOST}
""".stripIndent()
                    }
                }
            }
        }

        stage('Deploy Stack') {
            steps {
                script {
                    def downCmd = 'docker-compose down'
                    if (params.CLEAN_VOLUMES) {
                        downCmd = 'docker-compose down -v'
                        echo "Cleaning volumes..."
                    }
                    sh downCmd
                    // Build ใหม่และรันขึ้นมา
                    sh 'docker-compose up -d --build'
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Waiting for services (15s)..."
                    sleep 15
                    // เช็คว่า Container ยังอยู่ดีไหม
                    sh 'docker-compose ps'
                    // เช็คว่า API (Go Fiber) ตอบรับไหม
                    sh "curl -f ${params.API_HOST}/attractions || exit 1"
                    echo "All systems GO!"
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f'
        }
        success {
            echo " Deploy สำเร็จ! เข้าใช้งานได้ที่ http://10.198.110.26:3000"
        }
        failure {
            echo " Deploy ล้มเหลว ตรวจสอบ Log ด้านบน"
            sh 'docker-compose logs --tail=50'
        }
    }
}