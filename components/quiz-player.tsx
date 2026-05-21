'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Trophy, RotateCcw, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Quiz, QuizQuestion, QuizAttempt } from '@/lib/types'

interface QuizPlayerProps {
  quiz: Quiz & { questions: QuizQuestion[] }
  userId: string
  previousAttempt?: QuizAttempt | null
  onPass?: () => void
}

type PlayerState = 'intro' | 'playing' | 'result'

export function QuizPlayer({ quiz, userId, previousAttempt, onPass }: QuizPlayerProps) {
  const [state, setState] = useState<PlayerState>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [attempt, setAttempt] = useState<QuizAttempt | null>(previousAttempt || null)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()
  const questions = quiz.questions
  const currentQuestion = questions[currentIndex]

  function startQuiz() {
    setAnswers({})
    setCurrentIndex(0)
    setSelectedOption(null)
    setShowFeedback(false)
    setState('playing')
  }

  function handleSelectOption(option: string) {
    if (showFeedback) return
    setSelectedOption(option)
  }

  function handleConfirmAnswer() {
    if (!selectedOption || !currentQuestion) return
    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption }
    setAnswers(newAnswers)
    setShowFeedback(true)
  }

  function handleNext() {
    setShowFeedback(false)
    setSelectedOption(null)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      finishQuiz(answers)
    }
  }

  async function finishQuiz(finalAnswers: Record<string, string>) {
    setIsSaving(true)
    const correct = questions.filter(q => finalAnswers[q.id] === q.correct_answer).length
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= quiz.passing_score

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quiz.id,
        score,
        passed,
        answers: finalAnswers,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to save quiz result')
    } else {
      setAttempt(data)
      if (passed) {
        toast.success(`Quiz passed with ${score}%!`)
        onPass?.()
      } else {
        toast.error(`Score: ${score}% - Need ${quiz.passing_score}% to pass`)
      }
    }
    setIsSaving(false)
    setState('result')
  }

  const isCorrect = showFeedback && selectedOption === currentQuestion?.correct_answer
  const progressValue = ((currentIndex) / questions.length) * 100

  // ---- INTRO ----
  if (state === 'intro') {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{quiz.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>{questions.length} questions</span>
            <span>Passing score: {quiz.passing_score}%</span>
          </div>
          {attempt && (
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              attempt.passed
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {attempt.passed
                ? <CheckCircle className="h-4 w-4" />
                : <XCircle className="h-4 w-4" />}
              <span>
                Last attempt: {attempt.score}% — {attempt.passed ? 'Passed' : 'Failed'}
              </span>
            </div>
          )}
          <Button size="sm" onClick={startQuiz}>
            {attempt ? (
              <><RotateCcw className="mr-2 h-4 w-4" />Retake Quiz</>
            ) : (
              'Start Quiz'
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ---- PLAYING ----
  if (state === 'playing') {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <Badge variant="outline">{quiz.passing_score}% to pass</Badge>
          </div>
          <Progress value={progressValue} className="h-1.5" />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium">{currentQuestion?.question_text}</p>

          <div className="space-y-2">
            {(Array.isArray(currentQuestion?.options) ? currentQuestion.options : []).map((option: string) => {
              let variant = 'outline' as const
              let extraClass = 'hover:border-primary hover:bg-primary/5 cursor-pointer'

              if (showFeedback) {
                if (option === currentQuestion.correct_answer) {
                  extraClass = 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700 cursor-default'
                } else if (option === selectedOption && option !== currentQuestion.correct_answer) {
                  extraClass = 'border-destructive bg-destructive/10 text-destructive cursor-default'
                } else {
                  extraClass = 'opacity-50 cursor-default'
                }
              } else if (option === selectedOption) {
                extraClass = 'border-primary bg-primary/10 cursor-pointer'
              }

              return (
                <button
                  key={option}
                  onClick={() => handleSelectOption(option)}
                  disabled={showFeedback}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${extraClass}`}
                >
                  {showFeedback && option === currentQuestion.correct_answer && (
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                  )}
                  {showFeedback && option === selectedOption && option !== currentQuestion.correct_answer && (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                  {option}
                </button>
              )
            })}
          </div>

          {showFeedback && (
            <div className={`rounded-lg px-3 py-2 text-sm ${
              isCorrect
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {isCorrect ? 'Correct!' : `Incorrect. The answer is: ${currentQuestion?.correct_answer}`}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {!showFeedback ? (
              <Button
                size="sm"
                onClick={handleConfirmAnswer}
                disabled={!selectedOption}
              >
                Confirm Answer
              </Button>
            ) : (
              <Button size="sm" onClick={handleNext} disabled={isSaving}>
                {currentIndex < questions.length - 1 ? (
                  <>Next <ChevronRight className="ml-1 h-4 w-4" /></>
                ) : (
                  'Finish Quiz'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // ---- RESULT ----
  const score = attempt?.score ?? 0
  const passed = attempt?.passed ?? false
  const correct = Math.round((score / 100) * questions.length)

  return (
    <Card className={passed ? 'border-green-500/50' : 'border-destructive/30'}>
      <CardContent className="py-6 text-center space-y-3">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-destructive/10'
        }`}>
          {passed
            ? <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
            : <XCircle className="h-8 w-8 text-destructive" />}
        </div>
        <div>
          <p className="text-2xl font-bold">{score}%</p>
          <p className="text-muted-foreground text-sm">
            {correct} of {questions.length} correct
          </p>
        </div>
        <Badge variant={passed ? 'default' : 'destructive'} className="text-sm px-3 py-1">
          {passed ? 'Passed!' : `Failed — need ${quiz.passing_score}%`}
        </Badge>
        <div className="pt-2">
          <Button size="sm" variant="outline" onClick={startQuiz}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
