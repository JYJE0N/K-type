'use client'

import { useState } from 'react'
import axios from 'axios'

export default function TestDBPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setTesting(true)
    setError(null)
    setResults(null)

    try {
      const response = await axios.get('/api/test-db')
      setResults(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
      setResults(err.response?.data)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-text-primary">MongoDB 연결 테스트</h1>
        
        <div className="bg-surface rounded-lg p-6 mb-6">
          <button
            onClick={testConnection}
            disabled={testing}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              testing 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-typing-accent text-background hover:opacity-90'
            }`}
          >
            {testing ? '테스트 중...' : 'MongoDB 연결 테스트'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-bold text-red-500 mb-2">❌ 에러 발생</h2>
            <p className="text-text-primary">{error}</p>
            {results?.suggestion && (
              <p className="text-text-secondary mt-2">💡 {results.suggestion}</p>
            )}
          </div>
        )}

        {results?.success && (
          <div className="space-y-4">
            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4">
              <h2 className="text-lg font-bold text-green-500">✅ {results.message}</h2>
            </div>

            <div className="bg-surface rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-text-primary">연결 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-text-secondary w-32">연결 상태:</span>
                  <span className={results.results.connection ? 'text-green-500' : 'text-red-500'}>
                    {results.results.connection ? '✅ 연결됨' : '❌ 연결 실패'}
                  </span>
                </div>
                {results.results.database && (
                  <>
                    <div className="flex">
                      <span className="text-text-secondary w-32">호스트:</span>
                      <span className="text-text-primary">{results.results.database.host}</span>
                    </div>
                    <div className="flex">
                      <span className="text-text-secondary w-32">포트:</span>
                      <span className="text-text-primary">{results.results.database.port}</span>
                    </div>
                    <div className="flex">
                      <span className="text-text-secondary w-32">데이터베이스:</span>
                      <span className="text-text-primary">{results.results.database.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-surface rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-text-primary">테스트 결과</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="text-text-secondary w-32">문서 생성:</span>
                  <span className={results.results.testWrite ? 'text-green-500' : 'text-red-500'}>
                    {results.results.testWrite ? '✅ 성공' : '❌ 실패'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-text-secondary w-32">문서 조회:</span>
                  <span className={results.results.testRead ? 'text-green-500' : 'text-red-500'}>
                    {results.results.testRead ? '✅ 성공' : '❌ 실패'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-text-secondary w-32">문서 삭제:</span>
                  <span className={results.results.testDelete ? 'text-green-500' : 'text-red-500'}>
                    {results.results.testDelete ? '✅ 성공' : '❌ 실패'}
                  </span>
                </div>
              </div>
            </div>

            {results.results.collections && (
              <div className="bg-surface rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-text-primary">컬렉션 목록</h3>
                {results.results.collections.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {results.results.collections.map((col: string) => (
                      <li key={col} className="text-text-secondary text-sm">{col}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-secondary text-sm">컬렉션이 없습니다</p>
                )}
                <div className="mt-4 pt-4 border-t border-text-secondary border-opacity-20">
                  <p className="text-text-secondary text-sm">
                    UserProgress 컬렉션: {results.results.userProgressCollection}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {results && !results.success && results.error && (
          <div className="bg-surface rounded-lg p-6 mt-4">
            <h3 className="text-lg font-bold mb-4 text-red-500">에러 상세 정보</h3>
            <pre className="text-xs text-text-secondary overflow-x-auto">
              {JSON.stringify(results.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}