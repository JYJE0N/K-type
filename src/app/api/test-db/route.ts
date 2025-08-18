import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function GET() {
  const results: any = {
    connection: false,
    database: null,
    collections: [],
    testWrite: false,
    testRead: false,
    testDelete: false,
    error: null
  }

  try {
    // 1. MongoDB 연결 테스트
    console.log('🔌 MongoDB 연결 시도...')
    await connectDB()
    results.connection = true
    
    // 2. 데이터베이스 정보
    const connection = mongoose.connection
    results.database = {
      host: connection.host,
      port: connection.port,
      name: connection.name,
      readyState: connection.readyState === 1 ? '연결됨' : '연결안됨'
    }
    console.log('✅ MongoDB 연결 성공:', results.database)
    
    // 3. 컬렉션 목록 조회
    if (connection.db) {
      const collections = await connection.db.listCollections().toArray()
      results.collections = collections.map(col => col.name)
      console.log('📚 컬렉션 목록:', results.collections)
    }
    
    // 4. 테스트 스키마로 CRUD 테스트
    const TestSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now }
    })
    
    const TestModel = mongoose.models.TestConnection || mongoose.model('TestConnection', TestSchema)
    
    // Create 테스트
    const testDoc = await TestModel.create({
      message: 'K-types MongoDB 연결 테스트',
      timestamp: new Date()
    })
    results.testWrite = !!testDoc._id
    console.log('✅ 문서 생성 성공:', testDoc._id)
    
    // Read 테스트
    const foundDoc = await TestModel.findById(testDoc._id)
    results.testRead = !!foundDoc
    console.log('✅ 문서 조회 성공')
    
    // Delete 테스트 (정리)
    await TestModel.findByIdAndDelete(testDoc._id)
    results.testDelete = true
    console.log('✅ 문서 삭제 성공')
    
    // UserProgress 컬렉션 확인
    const userProgressExists = results.collections.includes('userprogresses')
    results.userProgressCollection = userProgressExists ? '존재' : '첫 사용 시 자동 생성됨'
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB 연결 테스트 성공',
      results
    })
    
  } catch (error: any) {
    console.error('❌ MongoDB 테스트 실패:', error)
    
    results.error = {
      name: error.name,
      message: error.message,
      code: error.code
    }
    
    let errorMessage = 'MongoDB 연결 실패'
    let suggestion = ''
    
    if (error.name === 'MongoServerError') {
      suggestion = 'MongoDB 서버 에러입니다. 연결 정보를 확인하세요.'
    } else if (error.name === 'MongoNetworkError' || error.name === 'MongoNetworkTimeoutError') {
      suggestion = '네트워크 에러입니다. MongoDB 서버 URL과 네트워크 연결을 확인하세요.'
    } else if (error.code === 'ECONNREFUSED') {
      suggestion = '연결이 거부되었습니다. MongoDB 서버가 실행 중인지 확인하세요.'
    } else if (error.message.includes('authentication')) {
      suggestion = '인증 실패입니다. 사용자명과 비밀번호를 확인하세요.'
    }
    
    return NextResponse.json({
      success: false,
      message: errorMessage,
      suggestion,
      results,
      error: {
        name: error.name,
        message: error.message,
        code: error.code
      }
    }, { status: 500 })
  }
}