'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { FileText, Upload, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Document {
  id: string
  document_type: string
  document_name: string
  document_url: string
  verified: boolean
  uploaded_at: string
}

interface ProfileDocumentsProps {
  documents: Document[]
  isTasker: boolean
}

export function ProfileDocuments({ documents, isTasker }: ProfileDocumentsProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [documentType, setDocumentType] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const documentTypes = [
    { value: 'id', label: 'Government ID' },
    { value: 'certification', label: 'Certification' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'license', label: 'Professional License' },
    { value: 'other', label: 'Other' }
  ]

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !documentType) {
      toast.error('Please select a document type first')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${documentType}-${Date.now()}.${fileExt}`
      const filePath = `documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      // Save document record
      const { error: dbError } = await supabase
        .from('profile_documents')
        .insert({
          profile_id: user.id,
          document_type: documentType,
          document_name: file.name,
          document_url: publicUrl
        })

      if (dbError) throw dbError

      toast.success('Document uploaded successfully')
      router.refresh()
      
      // Reset form
      setDocumentType('')
      if (e.target) e.target.value = ''
    } catch (error) {
      toast.error('Error uploading document')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const deleteDocument = async (docId: string, docUrl: string) => {
    setDeletingId(docId)
    const supabase = createClient()
    
    try {
      // Extract file path from URL
      const urlParts = docUrl.split('/storage/v1/object/public/profiles/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        
        // Delete from storage
        await supabase.storage
          .from('profiles')
          .remove([filePath])
      }

      // Delete database record
      const { error } = await supabase
        .from('profile_documents')
        .delete()
        .eq('id', docId)

      if (error) throw error

      toast.success('Document deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Error deleting document')
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find(dt => dt.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Upload documents to verify your identity and qualifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Upload File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading || !documentType}
                  className="flex-1"
                />
                {uploading && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            Manage your uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">{doc.document_name}</p>
                      <p className="text-xs text-gray-500">
                        {getDocumentTypeLabel(doc.document_type)} • 
                        Uploaded {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Verified
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.document_url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id, doc.document_url)}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}