
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, Heart, Award, Users, Clock, MapPin } from 'lucide-react';

const AboutPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats = [
    { icon: <Camera size={24} />, value: "500+", label: "Weddings Captured" },
    { icon: <Heart size={24} />, value: "300+", label: "Happy Couples" },
    { icon: <Award size={24} />, value: "15+", label: "Years Experience" },
    { icon: <MapPin size={24} />, value: "50+", label: "Destinations" }
  ];

  const team = [
    { 
      name: "Rajiv Sharma", 
      role: "Lead Photographer & Founder", 
      bio: "With over 15 years of experience in wedding photography, Rajiv has a unique eye for capturing emotions and moments that tell a story.",
      image: "rajiv-sharma"
    },
    { 
      name: "Priya Patel", 
      role: "Senior Photographer", 
      bio: "Priya specializes in candid photography and has a talent for capturing the most genuine emotions during wedding ceremonies.",
      image: "priya-patel"
    },
    { 
      name: "Vikram Singh", 
      role: "Cinematographer", 
      bio: "Vikram brings weddings to life through his cinematic approach to wedding films, creating emotional and beautiful memories.",
      image: "vikram-singh"
    },
    { 
      name: "Ananya Reddy", 
      role: "Creative Director", 
      bio: "Ananya oversees the creative vision for each project, ensuring that every wedding story is told in a unique and beautiful way.",
      image: "ananya-reddy"
    }
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Scotland Yard Productions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We are passionate storytellers dedicated to capturing the beauty and emotions of Indian weddings.
          </p>
        </motion.div>

        {/* Our Story */}
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-12 mb-20"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            initial: { opacity: 0 },
            animate: { 
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          <motion.div 
            className="md:w-1/2"
            variants={fadeIn}
          >
            <img  className="rounded-lg shadow-xl w-full h-[500px] object-cover" alt="Team of photographers" src="https://images.unsplash.com/photo-1614725077723-139ccd57f7f8" />
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 space-y-6"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="text-lg text-muted-foreground">
              Scotland Yard Productions was founded in 2010 with a simple mission: to capture the magic, traditions, and emotions of Indian weddings in a way that tells a beautiful story.
            </p>
            <p className="text-lg text-muted-foreground">
              What started as a small team of passionate photographers has grown into a premier wedding photography company specializing in Indian weddings across the country and internationally.
            </p>
            <p className="text-lg text-muted-foreground">
              We understand the cultural significance and unique elements of Indian weddings, and we take pride in documenting these special moments with creativity, respect, and attention to detail.
            </p>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 bg-secondary/50 rounded-xl p-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            initial: { opacity: 0 },
            animate: { 
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center"
              variants={fadeIn}
            >
              <div className="flex justify-center mb-2 text-accent">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Our Approach */}
        <motion.div 
          className="mb-20"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            initial: { opacity: 0 },
            animate: { 
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          <motion.div 
            className="text-center mb-12"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">Our Approach</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe that every wedding is unique, and our approach to photography reflects this belief.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              variants={fadeIn}
            >
              <div className="text-accent mb-4">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Emotional Storytelling</h3>
              <p className="text-muted-foreground">
                We focus on capturing genuine emotions and interactions that tell the story of your special day.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              variants={fadeIn}
            >
              <div className="text-accent mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cultural Understanding</h3>
              <p className="text-muted-foreground">
                Our team understands the significance of each ritual and tradition in Indian weddings.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              variants={fadeIn}
            >
              <div className="text-accent mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Timeless Results</h3>
              <p className="text-muted-foreground">
                We create photographs that stand the test of time, becoming family heirlooms for generations.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Meet the Team */}
        <motion.div 
          className="mb-20"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            initial: { opacity: 0 },
            animate: { 
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          <motion.div 
            className="text-center mb-12"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our talented team of photographers and cinematographers are passionate about creating beautiful wedding memories.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md"
                variants={fadeIn}
              >
                <div className="h-64 overflow-hidden">
                  <img  className="w-full h-full object-cover" alt={member.name} src="https://images.unsplash.com/photo-1610449257708-7221b0b39687" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-accent mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center bg-primary text-primary-foreground rounded-xl p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Work With Us?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Let's create beautiful memories together. Contact us to check our availability for your wedding date.
          </p>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
