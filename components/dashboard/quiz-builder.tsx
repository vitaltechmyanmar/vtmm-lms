'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, CheckCircle, Circle, Edit2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Quiz, QuizQuestion } from '@/lib/types'

interface QuizBuilderProps {
  lessonId: string
  lessonTitle: string
}

export function QuizBuilder({ lessonId, lessonTitle }: QuizBuilderProps) {
  const [quiz, setQuiz] = useState<(Quiz & { questions: QuizQuestion[] }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [quizTitle, setQuizTitle] = useState('')
  const [passingScore, setPassingScore] = useState(70)
  const [isEditingQuiz, setIsEditingQuiz] = useState(false)

  // New question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchQuiz()
  }, [lessonId])

  async function fetchQuiz() {
    setIsLoading(true)
    const { data } = await supabase
      .from('quizzes')
      .select('*, questions:quiz_questions(*)')
      .eq('lesson_id', lessonId)
      .single()

    if (data) {
      const sorted = { ...data, questions: (data.questions || []).sort((a: QuizQuestion, b: QuizQuestion) => a.order_index - b.order_index) }
      setQuiz(sorted)
      setQuizTitle(sorted.title)
      setPassingScore(sorted.passing_score)
    }
    setIsLoading(false)
  }

  async function createQuiz() {
    if (!quizTitle.trim()) {
      toast.error('Please enter a quiz title')
      return
    }
    setIsSaving(true)
    const { data, error } = await supabase
      .from('quizzes')
      .insert({ lesson_id: lessonId, title: quizTitle, passing_score: passingScore })
      .select('*, questions:quiz_questions(*)')
      .single()

    if (error) {
      toast.error('Failed to create quiz')
      setIsSaving(false)
      return
    }
    setQuiz({ ...data, questions: [] })
    toast.success('Quiz created!')
    setIsSaving(false)
  }

  async function updateQuiz() {
    if (!quiz) return
    setIsSaving(true)
    const { error } = await supabase
      .from('quizzes')
      .update({ title: quizTitle, passing_score: passingScore })
      .eq('id', quiz.id)

    if (error) {
      toast.error('Failed to update quiz')
    } else {
      setQuiz({ ...quiz, title: quizTitle, passing_score: passingScore })
      setIsEditingQuiz(false)
      toast.success('Quiz updated!')
    }
    setIsSaving(false)
  }

  async function deleteQuiz() {
    if (!quiz) return
    const { error } = await supabase.from('quizzes').delete().eq('id', quiz.id)
    if (error) {
      toast.error('Failed to delete quiz')
      return
    }
    setQuiz(null)
    setQuizTitle('')
    setPassingScore(70)
    toast.success('Quiz deleted')
  }

  function resetQuestionForm() {
    setQuestionText('')
    setOptions(['', '', '', ''])
    setCorrectAnswer('')
    setEditingQuestionId(null)
    setShowQuestionForm(false)
  }

  function startEditQuestion(q: QuizQuestion) {
    setQuestionText(q.question_text)
    setOptions(Array.isArray(q.options) ? [...q.options] : ['', '', '', ''])
    setCorrectAnswer(q.correct_answer)
    setEditingQuestionId(q.id)
    setShowQuestionForm(true)
  }

  async function saveQuestion() {
    if (!quiz) return
    if (!questionText.trim()) { toast.error('Question text is required'); return }
    const validOptions = options.filter(o => o.trim())
    if (validOptions.length < 2) { toast.error('At least 2 options required'); return }
    if (!correctAnswer.trim() || !validOptions.includes(correctAnswer)) {
      toast.error('Select a valid correct answer')
      return
    }

    setIsSaving(true)
    if (editingQuestionId) {
      const { error } = await supabase
        .from('quiz_questions')
        .update({ question_text: questionText, options: validOptions, correct_answer: correctAnswer })
        .eq('id', editingQuestionId)
      if (error) { toast.error('Failed to update question'); setIsSaving(false); return }
      setQuiz({
        ...quiz,
        questions: quiz.questions.map(q =>
          q.id === editingQuestionId
            ? { ...q, question_text: questionText, options: validOptions, correct_answer: correctAnswer }
            : q
        ),
      })
      toast.success('Question updated!')
    } else {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question_text: questionText,
          options: validOptions,
          correct_answer: correctAnswer,
          order_index: quiz.questions.length,
        })
        .select()
        .single()
      if (error) { toast.error('Failed to add question'); setIsSaving(false); return }
      setQuiz({ ...quiz, questions: [...quiz.questions, data] })
      toast.success('Question added!')
    }
    setIsSaving(false)
    resetQuestionForm()
  }

  async function deleteQuestion(questionId: string) {
    if (!quiz) return
    const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId)
    if (error) { toast.error('Failed to delete question'); return }
    setQuiz({ ...quiz, questions: quiz.questions.filter(q => q.id !== questionId) })
    toast.success('Question deleted')
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading quiz...</span>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="space-y-3 rounded-lg border border-dashed p-4">
        <p className="text-sm font-medium">No quiz for this lesson yet</p>
        <div className="space-y-2">
          <Input
            placeholder="Quiz title (e.g. End-of-lesson quiz)"
            value={quizTitle}
            onChange={e => setQuizTitle(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Label className="w-32 shrink-0 text-sm">Passing score (%)</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={passingScore}
              onChange={e => setPassingScore(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
        <Button size="sm" onClick={createQuiz} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Quiz
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quiz header */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
        {isEditingQuiz ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={quizTitle}
              onChange={e => setQuizTitle(e.target.value)}
              className="h-8 max-w-xs"
            />
            <Input
              type="number"
              min={1}
              max={100}
              value={passingScore}
              onChange={e => setPassingScore(Number(e.target.value))}
              className="h-8 w-20"
            />
            <span className="text-xs text-muted-foreground">% to pass</span>
            <Button size="sm" variant="outline" onClick={updateQuiz} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditingQuiz(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <div>
              <span className="font-medium">{quiz.title}</span>
              <Badge variant="secondary" className="ml-2 text-xs">{quiz.passing_score}% to pass</Badge>
              <Badge variant="outline" className="ml-1 text-xs">{quiz.questions.length} questions</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setIsEditingQuiz(true)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete quiz?</AlertDialogTitle>
                    <AlertDialogDescription>This will delete all questions and student attempts.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteQuiz} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </div>

      {/* Questions list */}
      {quiz.questions.length > 0 && (
        <div className="space-y-2">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">Q{idx + 1}. {q.question_text}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(Array.isArray(q.options) ? q.options : []).map((opt: string) => (
                      <span
                        key={opt}
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${
                          opt === q.correct_answer
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {opt === q.correct_answer && <CheckCircle className="h-3 w-3" />}
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => startEditQuestion(q)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete question?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteQuestion(q.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/edit question form */}
      {showQuestionForm ? (
        <Card className="border-primary/30">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm">{editingQuestionId ? 'Edit Question' : 'New Question'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Question</Label>
              <Input
                placeholder="Enter your question"
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Options (click radio to mark correct answer)</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(opt.trim())}
                    className="shrink-0"
                    aria-label={`Mark option ${i + 1} as correct`}
                  >
                    {correctAnswer === opt.trim() && opt.trim() ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => {
                      const next = [...options]
                      if (correctAnswer === opt.trim()) setCorrectAnswer(e.target.value.trim())
                      next[i] = e.target.value
                      setOptions(next)
                    }}
                  />
                </div>
              ))}
            </div>
            {correctAnswer && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Correct answer: <strong>{correctAnswer}</strong>
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={saveQuestion} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                {editingQuestionId ? 'Update' : 'Add Question'}
              </Button>
              <Button size="sm" variant="outline" onClick={resetQuestionForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowQuestionForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      )}
    </div>
  )
}
