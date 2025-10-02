import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { School, supabase } from '../lib/supabase'

const Schools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [editing, setEditing] = useState<School | null>(null)

  const fetchSchools = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setSchools(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSchools() }, [])

  const handleAdd = async () => {
    if (!name || !shortName) return
    setLoading(true)
    try {
      const { error } = await supabase.from('schools').insert([{ name, short_name: shortName }])
      if (error) throw error
      setName('')
      setShortName('')
      fetchSchools()
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleEdit = (school: School) => {
    setEditing(school)
    setName(school.name)
    setShortName(school.short_name)
  }

  const handleUpdate = async () => {
    if (!editing) return
    setLoading(true)
    try {
      const { error } = await supabase.from('schools').update({ name, short_name: shortName }).eq('id', editing.id)
      if (error) throw error
      setEditing(null)
      setName('')
      setShortName('')
      fetchSchools()
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this school?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('schools').delete().eq('id', id)
      if (error) throw error
      fetchSchools()
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Schools</h1>
          <p className="text-gray-600">Add, edit or remove schools</p>
        </div>
        <div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
            <Plus size={16} className="mr-2" /> Add School
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border rounded px-3 py-2" />
          <input placeholder="Short name" value={shortName} onChange={e => setShortName(e.target.value)} className="border rounded px-3 py-2" />
          <div className="flex space-x-2">
            {editing ? (
              <>
                <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded">Update</button>
                <button onClick={() => { setEditing(null); setName(''); setShortName('') }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              </>
            ) : (
              <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schools.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{s.name}</td>
                  <td className="px-6 py-4">{s.short_name}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(s)} className="text-gray-600 mr-3"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Schools
