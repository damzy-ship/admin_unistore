import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
// Assuming your Hostel type now includes 'gender: string'
import { Hostel, School, supabase } from '../lib/supabase'

// Define the possible genders for the dropdown
const GENDERS = ['Not Selected','Male', 'Female', 'Mixed'] as const
type Gender = typeof GENDERS[number]

const Hostels: React.FC = () => {
    const [hostels, setHostels] = useState<Hostel[]>([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [schoolId, setSchoolId] = useState('')
    // Add state for gender
    const [gender, setGender] = useState<Gender>('Not Selected') // Default to 'Not Selected'
    const [schools, setSchools] = useState<School[]>([])
    // Update Hostel type for editing state
    const [editing, setEditing] = useState<Hostel | null>(null)

    const fetchHostels = async () => {
        setLoading(true)
        try {
            // Select all columns including 'gender'
            const { data, error } = await supabase.from('hostels').select('*').order('created_at', { ascending: false })
            if (error) throw error
            setHostels(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchSchools = async () => {
        const { data } = await supabase.from('schools').select('*').order('name')
        setSchools(data || [])
    }

    useEffect(() => { fetchHostels(); fetchSchools() }, [])

    const handleAdd = async () => {
        // Include gender in the validation
        if (!name || !schoolId || !gender) return
        setLoading(true)
        try {
            // Include gender in the insert object
            const { error } = await supabase.from('hostels').insert([{ name, school_id: schoolId, gender }])
            if (error) throw error
            setName('')
            setSchoolId('')
            setGender('Not Selected') // Reset gender
            fetchHostels()
        } catch (err) {
            console.error(err)
        } finally { setLoading(false) }
    }

    const handleEdit = (h: Hostel) => {
        setEditing(h)
        setName(h.name)
        setSchoolId(h.school_id)
        // Set the gender state from the editing hostel
        setGender(h.gender as Gender) // Cast to Gender type
    }

    const handleUpdate = async () => {
        if (!editing) return
        // Include gender in the validation
        if (!name || !schoolId || !gender) return
        setLoading(true)
        try {
            // Include gender in the update object
            const { error } = await supabase.from('hostels').update({ name, school_id: schoolId, gender }).eq('id', editing.id)
            if (error) throw error
            setEditing(null)
            setName('')
            setSchoolId('')
            setGender('Not Selected') // Reset gender
            fetchHostels()
        } catch (err) {
            console.error(err)
        } finally { setLoading(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this hostel?')) return
        setLoading(true)
        try {
            const { error } = await supabase.from('hostels').delete().eq('id', id)
            if (error) throw error
            fetchHostels()
        } catch (err) {
            console.error(err)
        } finally { setLoading(false) }
    }

    if (loading) return <LoadingSpinner />

    return (
        <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Hostels</h1>
                    <p className="text-gray-600">Manage hostels linked to schools</p>
                </div>
                <div>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                        <Plus size={16} className="mr-2" /> Add Hostel
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
                {/* Adjusted grid to 5 columns or changed the colspan for actions */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <input
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                    <select
                        value={schoolId}
                        onChange={e => setSchoolId(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">Select school</option>
                        {schools.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}
                    </select>

                    {/* New Gender Dropdown */}
                    <select
                        value={gender}
                        onChange={e => setGender(e.target.value as Gender)}
                        className="border rounded px-3 py-2"
                    >
                        {GENDERS.map(g => <option value={g} key={g}>{g}</option>)}
                    </select>

                    <div className="col-span-2 flex space-x-2"> {/* Adjusted col-span to 2 for a cleaner layout */}
                        {editing ? (
                            <>
                                <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded">Update</button>
                                <button onClick={() => { setEditing(null); setName(''); setSchoolId(''); setGender('Male') }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                                {/* New Gender Header */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {hostels.map(h => (
                                <tr key={h.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{h.name}</td>
                                    <td className="px-6 py-4">{schools.find(s => s.id === h.school_id)?.name || 'Unknown'}</td>
                                    {/* Display Gender */}
                                    <td className="px-6 py-4">{h.gender}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(h)} className="text-gray-600 mr-3"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(h.id)} className="text-red-600"><Trash2 size={16} /></button>
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

export default Hostels