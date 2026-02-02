import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pmbukkiatxyoefpmmypg.supabase.co',
  'sb_publishable_VjjWV6wKBdlqJWVA6Rb1RA_vtNjjaIf'
);

const trades = ["All Trades", "Electrician", "Plumber", "HVAC Technician", "Carpenter", "Welder", "Roofer", "Mason", "Painter", "General Labor"];
const phoenixLocations = ["Phoenix", "Scottsdale", "Mesa", "Tempe", "Chandler", "Gilbert", "Glendale", "Peoria", "Surprise", "Goodyear", "Avondale", "Buckeye", "Queen Creek", "Apache Junction"];
const availabilityOptions = ["Any", "Immediate", "1 week", "2 weeks"];
const employmentTypes = ["Any", "Full-time", "Part-time", "Either"];
const experienceLevels = ["Any Experience", "1-5 years", "5-10 years", "10-15 years", "15+ years"];

export default function TradeHiringPlatform() {
  const [view, setView] = useState('landing');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    trade: "All Trades",
    availability: "Any",
    employmentType: "Any",
    experience: "Any Experience",
    location: "All Areas",
    maxRate: 100,
    minRating: 0,
    search: ""
  });
  const [sortBy, setSortBy] = useState("applied_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [expandedWorker, setExpandedWorker] = useState(null);
  const [formData, setFormData] = useState({
    name: "", trade: "", experience: "", hourlyRate: "", location: "",
    phone: "", email: "", availability: "", employmentType: "", certifications: "",
    resume: null, resumeName: "",
    ref1Name: "", ref1Phone: "", ref1Relationship: "",
    ref2Name: "", ref2Phone: "", ref2Relationship: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const YOUR_EMAIL = "leealley2001@gmail.com";
  const DASHBOARD_PASSWORD = "Tradework2026";

  // Load applicants from database
  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .order('applied_date', { ascending: false });
    
    if (error) {
      console.error('Error loading applicants:', error);
    } else {
      const formatted = data.map(app => ({
        id: app.id,
        name: app.name,
        email: app.email,
        phone: app.phone,
        location: app.location,
        trade: app.trade,
        experience: app.experience,
        hourlyRate: app.hourly_rate,
        employmentType: app.employment_type,
        availability: app.availability,
        certifications: app.certifications || [],
        hasResume: app.has_resume,
        resumeName: app.resume_name,
        references: [
          { name: app.ref1_name, phone: app.ref1_phone, relationship: app.ref1_relationship },
          { name: app.ref2_name, phone: app.ref2_phone, relationship: app.ref2_relationship }
        ],
        rating: app.rating || 0,
        appliedDate: app.applied_date
      }));
      setApplications(formatted);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Save to database
    const { data, error } = await supabase
      .from('applicants')
      .insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        trade: formData.trade,
        experience: parseInt(formData.experience),
        hourly_rate: parseInt(formData.hourlyRate),
        employment_type: formData.employmentType,
        availability: formData.availability,
        certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : [],
        has_resume: !!formData.resume,
        resume_name: formData.resumeName || null,
        ref1_name: formData.ref1Name,
        ref1_phone: formData.ref1Phone,
        ref1_relationship: formData.ref1Relationship,
        ref2_name: formData.ref2Name,
        ref2_phone: formData.ref2Phone,
        ref2_relationship: formData.ref2Relationship
      }])
      .select();

    if (error) {
      console.error('Database error:', error);
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Send email notification
    const submissionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      trade: formData.trade,
      experience: formData.experience + " years",
      hourlyRate: "$" + formData.hourlyRate + "/hr",
      employmentType: formData.employmentType,
      availability: formData.availability,
      certifications: formData.certifications || "None listed",
      reference1: `${formData.ref1Name} (${formData.ref1Relationship}) - ${formData.ref1Phone}`,
      reference2: `${formData.ref2Name} (${formData.ref2Relationship}) - ${formData.ref2Phone}`,
      hasResume: formData.resume ? "Yes - " + formData.resumeName : "No",
      _subject: `New Application: ${formData.name} - ${formData.trade} - ${formData.location}`,
      _template: "table",
    };

    try {
      await fetch(`https://formsubmit.co/ajax/${YOUR_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    setFormSubmitted(true);
    setIsSubmitting(false);
  };

  const deleteWorker = async (id) => {
    if (window.confirm('Delete this applicant?')) {
      const { error } = await supabase
        .from('applicants')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setApplications(prev => prev.filter(a => a.id !== id));
        setSelectedWorkers(prev => prev.filter(w => w !== id));
        if (expandedWorker === id) setExpandedWorker(null);
      }
    }
  };

  const deleteSelected = async () => {
    if (window.confirm(`Delete ${selectedWorkers.length} selected applicants?`)) {
      const { error } = await supabase
        .from('applicants')
        .delete()
        .in('id', selectedWorkers);
      
      if (!error) {
        setApplications(prev => prev.filter(a => !selectedWorkers.includes(a.id)));
        setSelectedWorkers([]);
      }
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filters.trade !== "All Trades" && app.trade !== filters.trade) return false;
    if (filters.availability !== "Any" && app.availability !== filters.availability) return false;
    if (filters.employmentType !== "Any" && app.employmentType !== filters.employmentType && app.employmentType !== "Either") return false;
    if (filters.location !== "All Areas" && app.location !== filters.location) return false;
    if (filters.experience !== "Any Experience") {
      const [min, max] = filters.experience.replace(/[^0-9-]/g, '').split('-').map(Number);
      if (filters.experience === "15+ years" && app.experience < 15) return false;
      else if (max && (app.experience < min || app.experience > max)) return false;
    }
    if (app.hourlyRate > filters.maxRate) return false;
    if (app.rating < filters.minRating) return false;
    if (filters.search && !app.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !app.location.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === "applied_date") comparison = new Date(a.appliedDate) - new Date(b.appliedDate);
    else if (sortBy === "experience") comparison = a.experience - b.experience;
    else if (sortBy === "hourlyRate") comparison = a.hourlyRate - b.hourlyRate;
    else if (sortBy === "rating") comparison = a.rating - b.rating;
    else if (sortBy === "name") comparison = a.name.localeCompare(b.name);
    return sortOrder === "desc" ? -comparison : comparison;
  });

  const toggleSelectWorker = (id) => {
    setSelectedWorkers(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredApplications.map(a => a.id);
    setSelectedWorkers(prev => {
      const allSelected = visibleIds.every(id => prev.includes(id));
      return allSelected ? prev.filter(id => !visibleIds.includes(id)) : [...new Set([...prev, ...visibleIds])];
    });
  };

  if (view === 'landing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#fff',
        fontFamily: "'Work Sans', sans-serif",
        color: '#1a1a1a'
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700;800;900&family=Oswald:wght@500;600;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          .urgent-banner {
            background: #d62828;
            color: white;
            padding: 12px 20px;
            text-align: center;
            font-family: 'Oswald', sans-serif;
            font-size: 18px;
            letter-spacing: 1px;
            animation: pulse-bg 2s ease-in-out infinite;
          }
          @keyframes pulse-bg {
            0%, 100% { background: #d62828; }
            50% { background: #b91c1c; }
          }
          
          .nav-btn {
            background: #d62828;
            border: none;
            color: white;
            padding: 12px 24px;
            font-family: 'Oswald', sans-serif;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .nav-btn:hover { background: #b91c1c; transform: scale(1.02); }
          
          .hero-section {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            padding: 60px 40px;
            position: relative;
            overflow: hidden;
          }
          .hero-section::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.5;
          }
          
          .cta-btn {
            background: #1a1a1a;
            border: none;
            color: #fbbf24;
            padding: 20px 50px;
            font-family: 'Oswald', sans-serif;
            font-size: 22px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
            box-shadow: 4px 4px 0 #000;
          }
          .cta-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #000; }
          
          .form-input {
            width: 100%;
            padding: 14px 16px;
            background: #fff;
            border: 3px solid #1a1a1a;
            color: #1a1a1a;
            font-family: 'Work Sans', sans-serif;
            font-size: 16px;
            transition: all 0.2s ease;
          }
          .form-input:focus { outline: none; border-color: #d62828; box-shadow: 3px 3px 0 #d62828; }
          .form-input::placeholder { color: #666; }
          
          .form-select {
            width: 100%;
            padding: 14px 16px;
            background: #fff;
            border: 3px solid #1a1a1a;
            color: #1a1a1a;
            font-family: 'Work Sans', sans-serif;
            font-size: 16px;
            cursor: pointer;
          }
          .form-select:focus { outline: none; border-color: #d62828; }
          
          .submit-btn {
            width: 100%;
            padding: 20px;
            background: #d62828;
            border: none;
            color: white;
            font-family: 'Oswald', sans-serif;
            font-size: 22px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.2s ease;
            box-shadow: 4px 4px 0 #7f1d1d;
          }
          .submit-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #7f1d1d; }
          .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: 4px 4px 0 #7f1d1d; }
          
          .location-tag {
            display: inline-block;
            padding: 8px 16px;
            background: #1a1a1a;
            color: #fbbf24;
            font-family: 'Oswald', sans-serif;
            font-size: 14px;
            margin: 4px;
            transition: all 0.2s ease;
          }
          .location-tag:hover { background: #d62828; color: white; }
          
          .benefit-card {
            background: #f5f5f5;
            border: 3px solid #1a1a1a;
            padding: 30px;
            text-align: center;
            transition: all 0.2s ease;
          }
          .benefit-card:hover { transform: translateY(-4px); box-shadow: 4px 4px 0 #1a1a1a; }
          
          .section-label {
            font-family: 'Oswald', sans-serif;
            font-size: 14px;
            color: #d62828;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          
          .ref-section {
            background: #f9fafb;
            border: 3px solid #1a1a1a;
            padding: 24px;
            margin-top: 24px;
          }
        `}</style>
        
        <div className="urgent-banner">
          NOW HIRING — IMMEDIATE POSITIONS AVAILABLE ACROSS THE VALLEY — APPLY TODAY
        </div>

        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', background: '#1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '50px', height: '50px', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #1a1a1a' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: '24px', color: '#1a1a1a' }}>⚡</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: '24px', color: '#fbbf24', lineHeight: 1 }}>TRADE WORK TODAY</div>
              <div style={{ fontFamily: "'Work Sans', sans-serif", fontSize: '11px', color: '#999', letterSpacing: '2px' }}>PHOENIX METRO</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="nav-btn" onClick={() => setShowLogin(true)}>Employer Login</button>
          </div>
        </nav>

        {showLogin && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#1a1a1a', padding: '40px', border: '3px solid #fbbf24', maxWidth: '400px', width: '90%' }}>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", color: '#fbbf24', marginBottom: '20px', textTransform: 'uppercase' }}>Employer Login</h3>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') { if(passwordInput === DASHBOARD_PASSWORD) { setView('dashboard'); setShowLogin(false); setPasswordInput(""); } else { alert('Incorrect password'); }}}}
                style={{ width: '100%', padding: '14px', background: '#fff', border: '3px solid #333', marginBottom: '16px', fontSize: '16px' }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => { if(passwordInput === DASHBOARD_PASSWORD) { setView('dashboard'); setShowLogin(false); setPasswordInput(""); } else { alert('Incorrect password'); }}}
                  style={{ flex: 1, padding: '14px', background: '#fbbf24', border: 'none', fontFamily: "'Oswald', sans-serif", fontSize: '16px', cursor: 'pointer', textTransform: 'uppercase' }}
                >Enter</button>
                <button 
                  onClick={() => { setShowLogin(false); setPasswordInput(""); }}
                  style={{ flex: 1, padding: '14px', background: '#333', color: '#fff', border: 'none', fontFamily: "'Oswald', sans-serif", fontSize: '16px', cursor: 'pointer', textTransform: 'uppercase' }}
                >Cancel</button>
              </div>
            </div>
          </div>
        )}

        <section className="hero-section">
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div className="section-label">Phoenix Metro's #1 Trade Job Board</div>
            <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '72px', fontWeight: 900, lineHeight: 1, marginBottom: '20px', color: '#1a1a1a', textTransform: 'uppercase' }}>
              GET HIRED<br/>THIS WEEK
            </h1>
            <p style={{ fontSize: '22px', color: '#1a1a1a', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
              Local contractors need skilled tradespeople <strong>right now</strong>. Full-time & part-time positions. Competitive pay. No recruiters — direct hire.
            </p>
            <button className="cta-btn" onClick={() => document.getElementById('apply-section').scrollIntoView({ behavior: 'smooth' })}>
              Apply in 5 Minutes →
            </button>
          </div>
        </section>

        <section style={{ background: '#1a1a1a', padding: '40px', textAlign: 'center' }}>
          <div className="section-label" style={{ color: '#fbbf24' }}>We Serve The Entire Valley</div>
          <div style={{ maxWidth: '900px', margin: '16px auto 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {phoenixLocations.map(loc => (
              <span key={loc} className="location-tag">{loc}</span>
            ))}
          </div>
        </section>

        <section style={{ padding: '60px 40px', background: '#fff' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="section-label">Why Tradespeople Choose Us</div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '42px', fontWeight: 700, textTransform: 'uppercase' }}>Real Jobs. Real Fast.</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {[
                { icon: '⏰', title: 'Same-Week Start', desc: 'Most hires start within 3-5 days' },
                { icon: '💵', title: 'Paid Weekly', desc: 'No waiting around for your money' },
                { icon: '🏠', title: '100% Local', desc: 'All jobs in the Phoenix metro' },
                { icon: '🤝', title: 'Direct Hire', desc: 'Work directly with contractors' }
              ].map((benefit, i) => (
                <div key={i} className="benefit-card">
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>{benefit.icon}</div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>{benefit.title}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{benefit.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '40px', background: '#fbbf24' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            {[
              { count: '23', label: 'Electrician Jobs' },
              { count: '18', label: 'Plumber Jobs' },
              { count: '31', label: 'HVAC Jobs' },
              { count: '45+', label: 'Total Openings' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '48px', fontWeight: 700, color: '#1a1a1a' }}>{stat.count}</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="apply-section" style={{ padding: '60px 40px', background: '#f5f5f5' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="section-label">Start Working This Week</div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '42px', fontWeight: 700, textTransform: 'uppercase' }}>Apply Now</h2>
              <p style={{ color: '#666', marginTop: '8px' }}>Takes about 5 minutes. We'll contact you within 24 hours.</p>
            </div>
            
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '50px', background: '#fff', border: '3px solid #059669' }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>✓</div>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', marginBottom: '12px', color: '#059669', textTransform: 'uppercase' }}>Application Received!</h3>
                <p style={{ color: '#666' }}>We'll call you within 24 hours to discuss available positions in your area.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: '#fff', border: '3px solid #1a1a1a', padding: '32px' }}>
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', marginBottom: '16px', textTransform: 'uppercase', borderBottom: '2px solid #1a1a1a', paddingBottom: '8px' }}>Your Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <input className="form-input" placeholder="Full Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input className="form-input" type="tel" placeholder="Phone Number *" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <input className="form-input" type="email" placeholder="Email Address *" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <select className="form-select" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                      <option value="">Your City *</option>
                      {phoenixLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', marginBottom: '16px', textTransform: 'uppercase', borderBottom: '2px solid #1a1a1a', paddingBottom: '8px' }}>Work Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <select className="form-select" required value={formData.trade} onChange={e => setFormData({...formData, trade: e.target.value})}>
                      <option value="">Your Trade *</option>
                      {trades.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input className="form-input" type="number" placeholder="Years Experience *" required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <select className="form-select" required value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})}>
                      <option value="">Full or Part-Time? *</option>
                      <option value="Full-time">Full-time Only</option>
                      <option value="Part-time">Part-time Only</option>
                      <option value="Either">Either Works</option>
                    </select>
                    <select className="form-select" required value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})}>
                      <option value="">When Can You Start? *</option>
                      <option value="Immediate">Immediately</option>
                      <option value="1 week">Within 1 Week</option>
                      <option value="2 weeks">Within 2 Weeks</option>
                    </select>
                    <input className="form-input" type="number" placeholder="Desired $/hr *" required value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: e.target.value})} />
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <input className="form-input" placeholder="Certifications (comma-separated, e.g. OSHA 30, EPA 608)" value={formData.certifications} onChange={e => setFormData({...formData, certifications: e.target.value})} />
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontFamily: "'Oswald', sans-serif", fontSize: '14px', marginBottom: '8px', color: '#666' }}>Resume (Optional)</label>
                    <div style={{ 
                      border: '3px dashed #ccc', 
                      padding: '20px', 
                      textAlign: 'center', 
                      background: '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => document.getElementById('resume-upload').click()}
                    >
                      <input 
                        type="file" 
                        id="resume-upload"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({...formData, resume: file, resumeName: file.name});
                          }
                        }}
                      />
                      {formData.resumeName ? (
                        <div>
                          <span style={{ fontSize: '24px' }}>📄</span>
                          <div style={{ marginTop: '8px', fontWeight: 600, color: '#1a1a1a' }}>{formData.resumeName}</div>
                          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>File selected ✓</div>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, resume: null, resumeName: ''}); }}
                            style={{ marginTop: '8px', padding: '4px 12px', background: '#dc2626', color: 'white', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: '24px' }}>📤</span>
                          <div style={{ marginTop: '8px', color: '#666' }}>Drop your resume here or <span style={{ color: '#d62828', fontWeight: 600 }}>click to browse</span></div>
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>PDF, DOC, or DOCX</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ref-section">
                  <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', marginBottom: '8px', textTransform: 'uppercase' }}>Work References (Required)</h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Please provide two professional references who can speak to your work quality.</p>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', marginBottom: '12px', color: '#d62828' }}>Reference #1</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <input className="form-input" placeholder="Full Name *" required value={formData.ref1Name} onChange={e => setFormData({...formData, ref1Name: e.target.value})} />
                      <input className="form-input" type="tel" placeholder="Phone Number *" required value={formData.ref1Phone} onChange={e => setFormData({...formData, ref1Phone: e.target.value})} />
                      <input className="form-input" placeholder="Relationship *" required value={formData.ref1Relationship} onChange={e => setFormData({...formData, ref1Relationship: e.target.value})} />
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', marginBottom: '12px', color: '#d62828' }}>Reference #2</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <input className="form-input" placeholder="Full Name *" required value={formData.ref2Name} onChange={e => setFormData({...formData, ref2Name: e.target.value})} />
                      <input className="form-input" type="tel" placeholder="Phone Number *" required value={formData.ref2Phone} onChange={e => setFormData({...formData, ref2Phone: e.target.value})} />
                      <input className="form-input" placeholder="Relationship *" required value={formData.ref2Relationship} onChange={e => setFormData({...formData, ref2Relationship: e.target.value})} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '24px' }} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application →"}
                </button>
                {submitError && (
                  <div style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', border: '2px solid #dc2626', color: '#dc2626', textAlign: 'center' }}>
                    {submitError}
                  </div>
                )}
              </form>
            )}
          </div>
        </section>

        <footer style={{ background: '#1a1a1a', padding: '30px 40px', textAlign: 'center' }}>
          <div style={{ color: '#fbbf24', fontFamily: "'Oswald', sans-serif", fontSize: '16px', marginBottom: '8px' }}>
            TRADE WORK TODAY — Serving the Phoenix Metro
          </div>
          <p style={{ color: '#666', fontSize: '14px' }}>
            📍 Phoenix, AZ &nbsp;|&nbsp; ✉️ jobs@tradeworktoday.com
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      fontFamily: "'Work Sans', sans-serif",
      color: '#e8e8e8'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .back-btn { background: transparent; border: 1px solid rgba(251,191,36,0.3); color: #fbbf24; padding: 10px 20px; font-family: 'Oswald', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; }
        .back-btn:hover { background: rgba(251,191,36,0.1); border-color: #fbbf24; }
        .filter-select { padding: 12px 16px; background: #1a1a1a; border: 1px solid #333; color: #e8e8e8; font-family: 'Work Sans', sans-serif; font-size: 14px; cursor: pointer; min-width: 140px; }
        .filter-select:focus { outline: none; border-color: #fbbf24; }
        .search-input { padding: 12px 16px; background: #1a1a1a; border: 1px solid #333; color: #e8e8e8; font-family: 'Work Sans', sans-serif; font-size: 14px; width: 200px; }
        .search-input:focus { outline: none; border-color: #fbbf24; }
        .worker-row { display: grid; grid-template-columns: 40px 1.5fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr 180px; gap: 12px; padding: 16px 20px; background: #141414; border: 1px solid #222; margin-bottom: 6px; align-items: center; transition: all 0.2s ease; cursor: pointer; }
        .worker-row:hover { background: #1a1a1a; border-color: #333; }
        .worker-row.expanded { border-color: #fbbf24; background: #1a1a1a; }
        .checkbox { width: 18px; height: 18px; accent-color: #fbbf24; cursor: pointer; }
        .contact-btn { padding: 6px 12px; font-family: 'Oswald', sans-serif; font-size: 11px; cursor: pointer; transition: all 0.2s ease; border: none; text-transform: uppercase; letter-spacing: 0.5px; }
        .email-btn { background: #fbbf24; color: #0d0d0d; }
        .email-btn:hover { background: #f59e0b; }
        .phone-btn { background: transparent; border: 1px solid #059669; color: #059669; }
        .phone-btn:hover { background: rgba(5,150,105,0.1); }
        .delete-btn { background: #dc2626; color: #fff; }
        .delete-btn:hover { background: #b91c1c; }
        .sort-btn { background: transparent; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-family: 'Oswald', sans-serif; font-size: 11px; display: flex; align-items: center; gap: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .sort-btn:hover { color: #fbbf24; }
        .sort-btn.active { color: #fbbf24; }
        .bulk-actions { display: flex; gap: 12px; padding: 14px 20px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); margin-bottom: 12px; align-items: center; }
        .bulk-btn { padding: 10px 20px; font-family: 'Oswald', sans-serif; font-size: 12px; cursor: pointer; border: none; background: #fbbf24; color: #0d0d0d; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; }
        .bulk-btn:hover { background: #f59e0b; }
        .cert-tag { display: inline-block; padding: 3px 6px; background: rgba(251,191,36,0.15); color: #fbbf24; font-size: 9px; margin: 2px; font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; }
        .header-row { display: grid; grid-template-columns: 40px 1.5fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr 180px; gap: 12px; padding: 14px 20px; background: #0a0a0a; border-bottom: 2px solid #fbbf24; font-family: 'Oswald', sans-serif; font-size: 11px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; }
        .range-slider { width: 100%; accent-color: #fbbf24; }
        .expand-panel { background: #1a1a1a; border: 1px solid #fbbf24; border-top: none; padding: 20px; margin-bottom: 6px; margin-top: -6px; }
        .ref-card { background: #222; padding: 12px; margin: 4px 0; }
        .type-badge { padding: 4px 8px; font-size: 10px; font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; }
      `}</style>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #222', background: '#111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="back-btn" onClick={() => setView('landing')}>← Back to Site</button>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1px' }}>Applicant Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="back-btn" onClick={loadApplicants}>↻ Refresh</button>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {filteredApplications.length} of {applications.length} applicants
          </div>
        </div>
      </header>

      <section style={{ padding: '20px 24px', background: '#111', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>Search</label>
            <input 
              className="search-input" 
              placeholder="Name..." 
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>Trade</label>
            <select className="filter-select" value={filters.trade} onChange={e => setFilters({...filters, trade: e.target.value})}>
              {trades.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>Location</label>
            <select className="filter-select" value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})}>
              <option value="All Areas">All Areas</option>
              {phoenixLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>Employment</label>
            <select className="filter-select" value={filters.employmentType} onChange={e => setFilters({...filters, employmentType: e.target.value})}>
              {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>Availability</label>
            <select className="filter-select" value={filters.availability} onChange={e => setFilters({...filters, availability: e.target.value})}>
              {availabilityOptions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>Experience</label>
            <select className="filter-select" value={filters.experience} onChange={e => setFilters({...filters, experience: e.target.value})}>
              {experienceLevels.map(exp => <option key={exp} value={exp}>{exp}</option>)}
            </select>
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>Max Rate: ${filters.maxRate}/hr</label>
            <input type="range" className="range-slider" min="20" max="100" value={filters.maxRate} onChange={e => setFilters({...filters, maxRate: parseInt(e.target.value)})} />
          </div>
        </div>
      </section>

      {selectedWorkers.length > 0 && (
        <div className="bulk-actions">
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px' }}>
            {selectedWorkers.length} selected
          </span>
          <button className="bulk-btn" onClick={() => {
            const emails = filteredApplications.filter(a => selectedWorkers.includes(a.id)).map(a => a.email).join(',');
            window.open(`mailto:${emails}?subject=Job Opportunity - Trade Work Today`);
          }}>
            Email All
          </button>
          <button className="bulk-btn" style={{ background: 'transparent', border: '1px solid #fbbf24', color: '#fbbf24' }} onClick={() => {
            const data = filteredApplications.filter(a => selectedWorkers.includes(a.id));
            const csv = ['Name,Trade,Experience,Rate,Location,Phone,Email,Employment Type,Availability,Rating,Ref1 Name,Ref1 Phone,Ref1 Relationship,Ref2 Name,Ref2 Phone,Ref2 Relationship']
              .concat(data.map(d => `${d.name},${d.trade},${d.experience},${d.hourlyRate},${d.location},${d.phone},${d.email},${d.employmentType},${d.availability},${d.rating},${d.references[0]?.name || ''},${d.references[0]?.phone || ''},${d.references[0]?.relationship || ''},${d.references[1]?.name || ''},${d.references[1]?.phone || ''},${d.references[1]?.relationship || ''}`))
              .join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'selected-workers.csv';
            a.click();
          }}>
            Export CSV
          </button>
          <button className="bulk-btn" style={{ background: '#dc2626' }} onClick={deleteSelected}>
            Delete Selected
          </button>
          <button className="bulk-btn" style={{ background: '#333' }} onClick={() => setSelectedWorkers([])}>
            Clear
          </button>
        </div>
      )}

      <div className="header-row">
        <div><input type="checkbox" className="checkbox" onChange={selectAllVisible} checked={filteredApplications.length > 0 && filteredApplications.every(a => selectedWorkers.includes(a.id))} /></div>
        <button className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`} onClick={() => { setSortBy('name'); setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <span>Trade</span>
        <span>Location</span>
        <span>Type</span>
        <button className={`sort-btn ${sortBy === 'experience' ? 'active' : ''}`} onClick={() => { setSortBy('experience'); setSortOrder(sortBy === 'experience' && sortOrder === 'desc' ? 'asc' : 'desc'); }}>
          Exp {sortBy === 'experience' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button className={`sort-btn ${sortBy === 'hourlyRate' ? 'active' : ''}`} onClick={() => { setSortBy('hourlyRate'); setSortOrder(sortBy === 'hourlyRate' && sortOrder === 'desc' ? 'asc' : 'desc'); }}>
          Rate {sortBy === 'hourlyRate' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <span>Avail</span>
        <span>Rating</span>
        <span>Actions</span>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading...</div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p>No applicants yet. They'll appear here when people apply.</p>
          </div>
        ) : (
          filteredApplications.map(worker => (
            <div key={worker.id}>
              <div 
                className={`worker-row ${expandedWorker === worker.id ? 'expanded' : ''}`} 
                style={{ borderColor: selectedWorkers.includes(worker.id) ? '#fbbf24' : expandedWorker === worker.id ? '#fbbf24' : '#222' }}
                onClick={() => setExpandedWorker(expandedWorker === worker.id ? null : worker.id)}
              >
                <input 
                  type="checkbox" 
                  className="checkbox" 
                  checked={selectedWorkers.includes(worker.id)}
                  onChange={(e) => { e.stopPropagation(); toggleSelectWorker(worker.id); }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{worker.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                    {worker.certifications.slice(0, 2).map((cert, i) => (
                      <span key={i} className="cert-tag">{cert}</span>
                    ))}
                    {worker.certifications.length > 2 && <span className="cert-tag">+{worker.certifications.length - 2}</span>}
                  </div>
                </div>
                <div style={{ color: '#fbbf24', fontWeight: 500, fontSize: '13px' }}>{worker.trade}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{worker.location}</div>
                <div>
                  <span className="type-badge" style={{ 
                    background: worker.employmentType === 'Full-time' ? 'rgba(5,150,105,0.2)' : worker.employmentType === 'Part-time' ? 'rgba(59,130,246,0.2)' : 'rgba(251,191,36,0.2)',
                    color: worker.employmentType === 'Full-time' ? '#10b981' : worker.employmentType === 'Part-time' ? '#3b82f6' : '#fbbf24'
                  }}>
                    {worker.employmentType === 'Full-time' ? 'FT' : worker.employmentType === 'Part-time' ? 'PT' : 'Any'}
                  </span>
                </div>
                <div style={{ fontSize: '13px' }}>{worker.experience} yrs</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '13px' }}>${worker.hourlyRate}</div>
                <div>
                  <span style={{ 
                    padding: '3px 8px', 
                    background: worker.availability === 'Immediate' ? 'rgba(5,150,105,0.2)' : 'rgba(251,191,36,0.2)',
                    color: worker.availability === 'Immediate' ? '#10b981' : '#fbbf24',
                    fontSize: '10px',
                    fontFamily: "'Oswald', sans-serif",
                    textTransform: 'uppercase'
                  }}>
                    {worker.availability === 'Immediate' ? 'Now' : worker.availability}
                  </span>
                </div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: '#fbbf24' }}>★</span> {worker.rating > 0 ? worker.rating.toFixed(1) : 'New'}
                </div>
                <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                  <button className="contact-btn email-btn" onClick={() => window.open(`mailto:${worker.email}?subject=Job Opportunity - Trade Work Today`)}>
                    Email
                  </button>
                  <button className="contact-btn phone-btn" onClick={() => window.open(`tel:${worker.phone}`)}>
                    Call
                  </button>
                  <button className="contact-btn delete-btn" onClick={() => deleteWorker(worker.id)}>
                    ✕
                  </button>
                </div>
              </div>
              
              {expandedWorker === worker.id && (
                <div className="expand-panel">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#fbbf24', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Info</div>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>📧 {worker.email}</div>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>📞 {worker.phone}</div>
                      <div style={{ fontSize: '14px', marginTop: '8px' }}>
                        {worker.hasResume ? (
                          <span style={{ color: '#10b981' }}>📄 Resume on file ✓</span>
                        ) : (
                          <span style={{ color: '#666' }}>📄 No resume</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#fbbf24', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Certifications</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {worker.certifications.map((cert, i) => (
                          <span key={i} className="cert-tag">{cert}</span>
                        ))}
                        {worker.certifications.length === 0 && <span style={{ color: '#666', fontSize: '13px' }}>None listed</span>}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '12px', color: '#fbbf24', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Work References</div>
                      {worker.references && worker.references.map((ref, i) => (
                        <div key={i} className="ref-card">
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{ref.name}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>{ref.relationship}</div>
                          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                            <a href={`tel:${ref.phone}`} style={{ color: '#10b981', textDecoration: 'none' }}>📞 {ref.phone}</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
