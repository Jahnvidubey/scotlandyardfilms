
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const ProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const projectData = await api.getProject(parseInt(id));
      if (projectData && !projectData.detail) {
        setProject(projectData);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-24 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-24 pb-20 container mx-auto px-4 text-center min-h-[60vh] flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/gallery">Back to Gallery</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to="/gallery">
              <ArrowLeft size={16} /> Back to Gallery
            </Link>
          </Button>
        </motion.div>

        {/* Project Header */}
        <motion.div 
          className="relative h-[60vh] rounded-xl overflow-hidden mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img loading="lazy" className="w-full h-full object-cover" alt={project.title} src={project.coverImage?.startsWith('/') ? project.coverImage : "https://images.unsplash.com/photo-1614312385003-dcea7b8b6ab6"} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{project.title}</h1>
            <div className="flex flex-wrap gap-4 mb-2">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                <span>{project.date}</span>
              </div>
              <div className="flex items-center">
                <MapPin size={16} className="mr-2" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center">
                <Tag size={16} className="mr-2" />
                <span>{project.category}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Description */}
        <motion.div 
          className="mb-12 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4">About This Project</h2>
          <p className="text-lg text-muted-foreground">{project.description}</p>
        </motion.div>

        {/* Project Gallery */}
        <motion.div 
          className="mb-16"
          initial="initial"
          animate="animate"
          variants={{
            initial: { opacity: 0 },
            animate: { 
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          <h2 className="text-2xl font-bold mb-6">Photo Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.images.map((image, index) => (
              <motion.div 
                key={image.id}
                className="rounded-lg overflow-hidden h-80 relative group"
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
              >
                <img loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={image.alt} src={image.src || "https://images.unsplash.com/photo-1495224814653-94f36c0a31ea"} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="font-medium">{image.alt}</h3>
                    <p className="text-sm opacity-90">{image.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Client Testimonial */}
        {project.testimonial && (
          <motion.div 
            className="mb-16 bg-secondary/50 rounded-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6">Client Testimonial</h2>
            <blockquote className="text-xl italic text-muted-foreground">
              "{project.testimonial}"
            </blockquote>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div 
          className="text-center bg-primary text-primary-foreground rounded-xl p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Own Wedding Story?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Let's capture your special day with the same attention to detail and creativity.
          </p>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectPage;
