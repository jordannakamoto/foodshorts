'use client';

import { useEffect, useRef, useState } from 'react';

import AddShortForm from './components/AddShortForm';
import ShortGrid from './components/ShortGrid';

export default function Page() {
  const [shorts, setShorts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterMeal, setFilterMeal] = useState('all');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mealDropdownOpen, setMealDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  
  const mealDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const loadShorts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/get-shorts');
      const data = await res.json();
      setShorts(data);
    } catch (error) {
      console.error('Failed to load shorts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShorts();
    
    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (mealDropdownRef.current && !mealDropdownRef.current.contains(event.target)) {
        setMealDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this short?')) {
      await fetch(`/api/delete-short?id=${id}`, { method: 'DELETE' });
      loadShorts();
    }
  };

  const handleEdit = (short) => {
    const newMeal = prompt('New meal:', short.meal);
    const newTags = prompt('New tags (comma-separated):', short.tags.join(', '));
    
    if (newMeal !== null && newTags !== null) {
      fetch('/api/update-short', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: short.id,
          meal: newMeal,
          tags: newTags.split(',').map(t => t.trim())
        })
      }).then(loadShorts);
    }
  };

  const mealOptions = [
    { value: 'all', label: 'All Meals' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'meal prep', label: 'Meal Prep' },
    { value: 'other', label: 'Other' },
  ];
  
  const sortOptions = [
    { value: 'date', label: 'Newest' },
    { value: 'title', label: 'Title' }
  ];

  const getMealLabel = () => {
    return mealOptions.find(option => option.value === filterMeal)?.label || 'All Meals';
  };
  
  const getSortLabel = () => {
    return sortOptions.find(option => option.value === sortBy)?.label || 'Newest';
  };

  const filtered = shorts
  .filter(s => {
    const searchLower = search.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(searchLower);
    const tagMatch = s.tags.some(tag => tag.toLowerCase().includes(searchLower));
    const mealMatch = filterMeal === 'all' || s.meal === filterMeal;
    const favoriteMatch = !filterFavorites || s.favorite;
    return (titleMatch || tagMatch) && mealMatch && favoriteMatch;
  })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.addedAt - a.addedAt;
    });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <AddShortForm onAdded={loadShorts} />
      
      {/* Modern search controls */}
      <div className="mt-5 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-grow max-w-sm">
          <input
            type="text"
            placeholder="Search titles & tags..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-indigo-300 text-sm"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button 
              onClick={() => setSearch('')} 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Custom Meal Dropdown */}
        <div className="relative" ref={mealDropdownRef}>
          <button 
            onClick={() => setMealDropdownOpen(!mealDropdownOpen)} 
            className="inline-flex items-center py-1.5 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-indigo-300"
          >
            <span>{getMealLabel()}</span>
            <svg className="ml-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {mealDropdownOpen && (
            <div className="absolute mt-1 z-10 bg-white rounded-md shadow-sm border border-gray-200 py-1 w-36">
              {mealOptions.map(option => (
                <div 
                  key={option.value}
                  onClick={() => {
                    setFilterMeal(option.value);
                    setMealDropdownOpen(false);
                  }}
                  className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 ${filterMeal === option.value ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Custom Sort Dropdown */}
        <div className="relative" ref={sortDropdownRef}>
          <button 
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)} 
            className="inline-flex items-center py-1.5 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-indigo-300"
          >
            <span>{getSortLabel()}</span>
            <svg className="ml-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {sortDropdownOpen && (
            <div className="absolute mt-1 right-0 z-10 bg-white rounded-md shadow-sm border border-gray-200 py-1 w-32">
              {sortOptions.map(option => (
                <div 
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setSortDropdownOpen(false);
                  }}
                  className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 ${sortBy === option.value ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
          
          <button
      onClick={() => setFilterFavorites(!filterFavorites)}
      className={`ml-3 inline-flex items-center py-1.5 px-3 border rounded-md text-sm ${
        filterFavorites
          ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
       Favorites
    </button>
        </div>
      </div>
          

      
      {isLoading ? (
        <div className="flex justify-center items-center p-6">
          <div className="animate-pulse flex space-x-1.5">
            <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></div>
            <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></div>
            <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></div>
          </div>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="mt-6 text-center py-10 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-sm">No matching videos found</p>
            </div>
          ) : (
            <ShortGrid shorts={filtered} onDelete={handleDelete} onEdit={handleEdit} />
          )}
        </>
      )}
    </div>
  );
}