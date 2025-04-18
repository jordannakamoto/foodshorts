import { useEffect, useRef, useState } from 'react';

import { parseShortsUrl } from '../lib/parseShorts';

export default function AddShortForm({ onAdded }) {
  const [url, setUrl] = useState('');
  const [selectedMeals, setSelectedMeals] = useState(['snack']);
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const formRef = useRef(null);

  const mealOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'desert', label: 'Dessert' },
    { value: 'meal prep', label: 'Meal Prep' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    // Parse URL and fetch tags as soon as a valid URL is pasted
    if (!url) return;
    
    const id = parseShortsUrl(url);
    if (!id) return;
    
    setVideoId(id);
    setIsLoading(true);
    setIsTagsLoading(true);
    
    // Fetch video title and AI tags in parallel
    const fetchVideoInfo = async () => {
      try {
        // Get video title
        const noEmbed = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
        const data = await noEmbed.json();
        setVideoTitle(data.title || '');
        setIsLoading(false);
        
        // Show form with animation
        setShowForm(true);
        
        // Get AI-generated tags
        const aiRes = await fetch(`/api/extract-tags?videoId=${id}`);
        const { tags: aiTags } = await aiRes.json();
        
        // Update tags input with AI-generated tags
        if (aiTags && aiTags.length > 0) {
          setTags(aiTags.join(', '));
        }
      } catch (error) {
        console.error('Error fetching video info:', error);
      } finally {
        setIsTagsLoading(false);
        setIsLoading(false);
      }
    };
    
    fetchVideoInfo();
  }, [url]);

  const toggleMeal = (meal) => {
    if (selectedMeals.includes(meal)) {
      setSelectedMeals(selectedMeals.filter(m => m !== meal));
    } else {
      setSelectedMeals([...selectedMeals, meal]);
    }
  };

  const handleAdd = async () => {
    if (!videoId) {
      alert('Please enter a valid YouTube Shorts URL');
      return;
    }
    
    if (selectedMeals.length === 0) {
      alert('Please select at least one meal type');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Process tags from the single input field
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      
      // Add short for each selected meal type
      await fetch('/api/add-short', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: videoId,
          title: videoTitle,
          addedAt: Date.now(),
          tags: tagArray,
          meal: selectedMeals
        })
      });
      
      onAdded(); // refresh list
      
      // Reset form
      setUrl('');
      setVideoId(null);
      setVideoTitle('');
      setTags('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding short:', error);
      alert('Failed to add short. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      {/* URL Input with paste button - always visible */}
      <div className="p-4">
        <div className="relative">
          <input 
            type="text"
            placeholder="Paste YouTube Shorts URL" 
            value={url} 
            onChange={e => setUrl(e.target.value)}
            className="w-full pl-3 pr-20 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
          {/* <button
            onClick={() => navigator.clipboard.readText().then(text => setUrl(text))}
            className="absolute right-1 top-1 bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs hover:bg-gray-100"
          >
            Paste
          </button> */}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-2">
            <div className="animate-pulse flex space-x-1">
              <div className="h-1.5 w-1.5 bg-indigo-300 rounded-full"></div>
              <div className="h-1.5 w-1.5 bg-indigo-300 rounded-full"></div>
              <div className="h-1.5 w-1.5 bg-indigo-300 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Expandable form section */}
      <div 
        ref={formRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ 
          maxHeight: showForm ? (formRef.current?.scrollHeight || '500px') : '0', 
          opacity: showForm ? 1 : 0 
        }}
      >
        <div className="px-4 pb-4">
          {/* Video title preview */}
          {videoTitle && (
            <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Video Title:</div>
                <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full pl-3 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                placeholder="Enter or edit the video title"
                />
            </div>
            )}
          
          {/* Meal Type Checkboxes */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Meal Type:</div>
            <div className="flex flex-wrap gap-1">
              {mealOptions.map(option => (
                <label 
                  key={option.value}
                  className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs cursor-pointer
                    ${selectedMeals.includes(option.value) 
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                      : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedMeals.includes(option.value)}
                    onChange={() => toggleMeal(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          
          {/* Combined Tags Input */}
          <div className="mb-4 relative">
            <input 
              type="text"
              placeholder="Tags (comma-separated)" 
              value={tags} 
              onChange={e => setTags(e.target.value)}
              className="w-full pl-3 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
              disabled={isTagsLoading}
            />
            {isTagsLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="animate-pulse flex space-x-1">
                  <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                  <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                  <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Add Button - less dramatic */}
          <button 
            onClick={handleAdd}
            disabled={isLoading}
            className={`
              w-full py-1.5 px-4 rounded-md text-sm font-medium
              ${isLoading 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300'}
            `}
          >
            {isLoading ? 'Adding...' : 'Add Short'}
          </button>
        </div>
      </div>
    </div>
  );
}