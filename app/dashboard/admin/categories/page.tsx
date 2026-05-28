'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Plus, MoreVertical, Pencil, Trash2, FolderTree, Loader2, ArrowUp, ArrowDown, BookOpen, LayoutGrid } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/lib/types'

const iconOptions = ['Code', 'Palette', 'Briefcase', 'Database', 'TrendingUp', 'Camera', 'Music', 'Globe', 'Book', 'Lightbulb', 'Cpu', 'Heart']
const colorOptions = ['#3B82F6', '#EC4899', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1']

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Code',
    color: '#3B82F6',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      toast.error('Failed to load categories')
      return
    }

    // Get course counts
    const { data: courses } = await supabase
      .from('courses')
      .select('category')

    const counts: Record<string, number> = {}
    courses?.forEach(c => {
      if (c.category) {
        counts[c.category] = (counts[c.category] || 0) + 1
      }
    })

    setCategories(data.map(cat => ({
      ...cat,
      courses_count: counts[cat.name] || 0
    })))
    setLoading(false)
  }

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function openCreateDialog() {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Code',
      color: '#3B82F6',
      is_active: true,
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || 'Code',
      color: category.color,
      is_active: category.is_active,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const categoryData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || null,
      icon: formData.icon,
      color: formData.color,
      is_active: formData.is_active,
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id)

      if (error) {
        toast.error(error.message)
        setSaving(false)
        return
      }
      toast.success('Category updated')
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          order_index: categories.length,
        })

      if (error) {
        toast.error(error.message)
        setSaving(false)
        return
      }
      toast.success('Category created')
    }

    setSaving(false)
    setIsDialogOpen(false)
    fetchCategories()
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Category deleted')
    fetchCategories()
  }

  async function handleToggleActive(category: Category) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id)

    if (error) {
      toast.error(error.message)
      return
    }

    fetchCategories()
  }

  async function handleReorder(category: Category, direction: 'up' | 'down') {
    const currentIndex = categories.findIndex(c => c.id === category.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= categories.length) return

    const otherCategory = categories[newIndex]

    await supabase.from('categories').update({ order_index: newIndex }).eq('id', category.id)
    await supabase.from('categories').update({ order_index: currentIndex }).eq('id', otherCategory.id)

    fetchCategories()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-blue-500/5 p-6 shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(to right,#8882 1px,transparent 1px),linear-gradient(to bottom,#8882 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium shadow-sm">
              <FolderTree className="h-3 w-3 text-primary" />
              Categories
            </div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="mt-1 text-muted-foreground">Manage and organize course categories.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update category details' : 'Add a new course category'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  placeholder="Programming"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="programming"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Learn to code with various programming languages"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`rounded-md border p-2 text-xs ${formData.icon === icon ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`h-8 w-8 rounded-full border-2 ${formData.color === color ? 'border-foreground' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving || !formData.name.trim()}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div
          className="rounded-xl border border-blue-200 dark:border-blue-900 p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg,#3b82f611,transparent)' }}
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <FolderTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{categories.length}</div>
          <div className="mt-1 text-xs text-muted-foreground font-medium">Total Categories</div>
        </div>
        <div
          className="rounded-xl border border-green-200 dark:border-green-900 p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg,#22c55e11,transparent)' }}
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
            <LayoutGrid className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold">{categories.filter(c => c.is_active).length}</div>
          <div className="mt-1 text-xs text-muted-foreground font-medium">Active Categories</div>
        </div>
        <div
          className="rounded-xl border border-purple-200 dark:border-purple-900 p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg,#a855f711,transparent)' }}
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold">{categories.reduce((sum, c) => sum + (c.courses_count || 0), 0)}</div>
          <div className="mt-1 text-xs text-muted-foreground font-medium">Total Courses</div>
        </div>
      </div>

      {/* Categories List */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <CardTitle className="text-base">All Categories</CardTitle>
          <CardDescription>Use the arrows to reorder categories.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No categories yet. Create your first category.</p>
          ) : (
            <div className="divide-y">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleReorder(category, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleReorder(category, 'down')}
                      disabled={index === categories.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon?.charAt(0) || 'C'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {!category.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>

                  <div className="text-sm text-muted-foreground shrink-0">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                      {category.courses_count || 0} courses
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                        {category.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(category)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
