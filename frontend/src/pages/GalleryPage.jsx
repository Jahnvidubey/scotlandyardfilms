
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

const GalleryPage = () => {
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then(data => {
      setProjects(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);
  
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.category.toLowerCase().includes(filter.toLowerCase()));

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'traditional', label: 'Traditional Wedding' },
    { id: 'destination', label: 'Destination Wedding' },
    { id: 'pre-wedding', label: 'Pre-Wedding' },
    { id: 'engagement', label: 'Engagement' }
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Photography Portfolio</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse through our collection of Indian wedding photography projects. Each project tells a unique love story.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === category.id 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : (
        <motion.div 
          className="gallery-grid"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {filteredProjects.map(project => (
            <motion.div 
              key={project.id}
              variants={fadeIn}
              className="gallery-item"
            >
              <Link to={`/project/${project.id}`}>
                <img loading="lazy" className="w-full h-full object-cover" alt={project.title} src={project.coverImage?.startsWith('/') ? project.coverImage : "https://images.unsplash.com/photo-1675023112817-52b789fd2ef0"} />
                <div className="gallery-overlay">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="text-sm opacity-80">{project.location} • {project.category}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-muted-foreground">No projects found for this category.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
