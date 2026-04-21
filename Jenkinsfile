pipeline {
    agent any

    environment {
        BUILD_TAG = "${env.BUILD_NUMBER}"
    }

    parameters {
        booleanParam(
            name: 'CLEAN_VOLUMES',
            defaultValue: false,
            description: 'เลือก True หากต้องการลบข้อมูลใน Database ทิ้งแล้วเริ่มใหม่ (ระวัง! ข้อมูลหาย)'
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
                    def downCmd = 'docker compose down'
                    if (params.CLEAN_VOLUMES) {
                        downCmd = 'docker compose down -v'
                        echo "Cleaning volumes and stopping containers..."
                    }
                    sh downCmd
                    
                    echo "Building and starting containers..."
                    sh 'docker compose up -d --build'
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Waiting for services to be ready (15s)..."
                    sleep 15
                    
                    echo "Current Container Status:"
                    sh 'docker compose ps'
                    
                    echo "Testing API connection..."
                    sh "curl -f ${params.API_HOST}/ || (echo 'API not responding' && exit 1)"
                    
                    echo " All systems GO!"
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up dangling images..."
            sh 'docker image prune -f'
        }
        success {
            echo "--------------------------------------------------------"
            echo "🚀 Deploy สำเร็จแล้ว!"
            echo "Frontend: http://10.198.110.26:3000"
            echo "API: http://10.198.110.26:3001"
            echo "phpMyAdmin: http://10.198.110.26:8081"
            echo "--------------------------------------------------------"
        }
        failure {
            echo " Deploy ล้มเหลว! กำลังดึง Logs 50 บรรทัดสุดท้ายมาให้ดู..."
            sh 'docker compose logs --tail=50'
        }
    }
}