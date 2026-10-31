import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  LockKeyhole,
  ScanText,
  SlidersHorizontal,
  Sparkles,
  Type,
  UploadCloud,
  Volume2,
  X,
} from 'lucide-react';

type Step = 'about' | 'records' | 'medication' | 'extensions';
type UploadedFile = { id: number; name: string; size: string };
type Extension = {
  id: string;
  title: string;
  description: string;
  icon: typeof ScanText;
  accent: string;
};

const steps: { id: Step; number: string; label: string; helper: string }[] = [
  { id: 'about', number: '01', label: 'About you', helper: 'A little context' },
  { id: 'records', number: '02', label: 'Records', helper: 'Your documents' },
  { id: 'medication', number: '03', label: 'Medication', helper: 'Current support' },
  { id: 'extensions', number: '04', label: 'Extensions', helper: 'Choose your tools' },
];

const extensions: Extension[] = [
  {
    id: 'plain-language',
    title: 'Plain-language reader',
    description: 'Explains clinical terms and rewrites complex sentences in an easy-read panel.',
    icon: ScanText,
    accent: 'teal',
  },
  {
    id: 'quiet-view',
    title: 'Quiet view',
    description: 'Clears visual noise, enlarges text, and gives important information more space.',
    icon: SlidersHorizontal,
    accent: 'blue',
  },
  {
    id: 'read-aloud',
    title: 'Read aloud',
    description: 'Reads medical pages out loud and highlights each phrase as it is spoken.',
    icon: Volume2,
    accent: 'amber',
  },
  {
    id: 'focus-type',
    title: 'Focus type',
    description: 'Adds a dyslexia-friendly typeface and a tracking bar that follows your cursor.',
    icon: Type,
    accent: 'coral',
  },
  {
    id: 'contrast',
    title: 'Contrast guide',
    description: 'Adjusts color contrast and makes important controls easier to distinguish.',
    icon: Sparkles,
    accent: 'navy',
  },
];

function App() {
  const [activeStep, setActiveStep] = useState<Step>('records');
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: 1, name: 'MRI_report.pdf', size: '5.8 MB' },
    { id: 2, name: 'Neuro_eval.pdf', size: '12.1 MB' },
  ]);
  const [medication, setMedication] = useState('');
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>(['plain-language', 'quiet-view']);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentIndex = steps.findIndex((step) => step.id === activeStep);
  const progress = useMemo(() => Math.round(((currentIndex + 1) / steps.length) * 100), [currentIndex]);

  const addFiles = (incomingFiles: FileList | File[]) => {
    const nextFiles = Array.from(incomingFiles)
      .filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
      .map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      }));
    setFiles((current) => [...current, ...nextFiles]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const removeFile = (id: number) => setFiles((current) => current.filter((file) => file.id !== id));

  const toggleExtension = (id: string) => {
    setSelectedExtensions((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const goForward = () => {
    const nextStep = steps[currentIndex + 1];
    if (nextStep) setActiveStep(nextStep.id);
    else setSaved(true);
  };

  const goBack = () => {
    const previousStep = steps[currentIndex - 1];
    if (previousStep) setActiveStep(previousStep.id);
  };

  const renderStepContent = () => {
    if (activeStep === 'about') {
      return (
        <section className="step-content" aria-labelledby="step-title">
          <p className="eyebrow">Step 1 · A little context</p>
          <h1 id="step-title">Tell us about your reading needs</h1>
          <p className="intro-copy">Your answers help AssiStar recommend a calmer, clearer way to read medical information.</p>
          <div className="form-grid">
            <label className="field wide"><span>What would you like support with?</span><textarea placeholder="For example: understanding long reports or staying focused on dense pages..." rows={4} /></label>
            <label className="field"><span>Preferred reading size</span><select defaultValue="Comfortable"><option>Comfortable</option><option>Larger</option><option>Extra large</option></select></label>
            <label className="field"><span>How should AssiStar speak to you?</span><select defaultValue="Clear and direct"><option>Clear and direct</option><option>Warm and encouraging</option><option>Just the essentials</option></select></label>
          </div>
        </section>
      );
    }

    if (activeStep === 'medication') {
      return (
        <section className="step-content" aria-labelledby="step-title">
          <p className="eyebrow">Step 3 · Current support</p>
          <h1 id="step-title">Add your medication details</h1>
          <p className="intro-copy">Share only what feels useful. This helps AssiStar recognize medication names when they appear in a document.</p>
          <label className="field wide"><span>Medication, dosage, or notes <small>Optional</small></span><textarea value={medication} onChange={(event) => setMedication(event.target.value)} placeholder="Example: Concerta 18mg each morning" rows={7} /></label>
          <div className="callout"><Info size={18} /><span>You can skip this step. Your information stays private and is only used to personalize your reading tools.</span></div>
        </section>
      );
    }

    if (activeStep === 'extensions') {
      return (
        <section className="step-content" aria-labelledby="step-title">
          <p className="eyebrow">Step 4 · Choose your tools</p>
          <h1 id="step-title">Set up your reading support</h1>
          <p className="intro-copy">Choose the tools you want available on medical websites. You can change these anytime.</p>
          <div className="extension-list">
            {extensions.map((extension) => {
              const Icon = extension.icon;
              const enabled = selectedExtensions.includes(extension.id);
              return (
                <button className={`extension-card ${enabled ? 'enabled' : ''}`} key={extension.id} onClick={() => toggleExtension(extension.id)} aria-pressed={enabled}>
                  <span className={`extension-icon ${extension.accent}`}><Icon size={22} strokeWidth={1.8} /></span>
                  <span className="extension-copy"><strong>{extension.title}</strong><span>{extension.description}</span></span>
                  <span className={`toggle ${enabled ? 'on' : ''}`}><span /></span>
                </button>
              );
            })}
          </div>
        </section>
      );
    }

    return (
      <section className="step-content" aria-labelledby="step-title">
        <p className="eyebrow">Step 2 · Your documents</p>
        <h1 id="step-title">Add your medical results</h1>
        <p className="intro-copy">Upload relevant documents to help tailor AssiStar to your reading needs. PDFs only, up to 50 MB each.</p>
        <div className="privacy-line"><LockKeyhole size={17} /> <span>Files are encrypted and kept private to you.</span></div>
        <div className={`dropzone ${dragging ? 'dragging' : ''}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
          <span className="upload-mark"><UploadCloud size={25} /></span>
          <strong>Drop your PDFs here</strong>
          <span>or <button type="button" className="browse-button" onClick={() => inputRef.current?.click()}>browse files</button></span>
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple onChange={handleFileChange} hidden />
        </div>
        <div className="file-list" aria-live="polite">
          {files.map((file) => (
            <div className="file-row" key={file.id}>
              <span className="file-icon"><FileText size={20} /></span>
              <span className="file-meta"><strong>{file.name}</strong><span>{file.size} · Ready to use</span></span>
              <button className="remove-button" onClick={() => removeFile(file.id)} aria-label={`Remove ${file.name}`}><X size={17} /></button>
            </div>
          ))}
          {files.length === 0 && <div className="empty-files">No documents added yet. You can continue without uploading.</div>}
        </div>
      </section>
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-star"><Sparkles size={20} /></span><span>AssiStar</span></div>
        <div className="top-progress"><span>Setup progress</span><strong>{progress}%</strong><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
        <div className="user-chip"><span className="avatar">AR</span><span className="user-name">Alex R.</span></div>
      </header>

      <main className="onboarding">
        <div className="page-heading"><span className="mini-rule" /> <span>Personalizing your reading support</span></div>
        <div className="workspace">
          <aside className="side-rail">
            <div className="rail-intro"><span className="rail-kicker">WELCOME TO</span><strong>AssiStar</strong><p>A clearer way through complex care.</p></div>
            <nav aria-label="Onboarding steps">
              {steps.map((step, index) => {
                const complete = index < currentIndex;
                const current = step.id === activeStep;
                return <button className={`step-item ${current ? 'current' : ''} ${complete ? 'complete' : ''}`} key={step.id} onClick={() => setActiveStep(step.id)}><span className="step-number">{complete ? <Check size={15} /> : step.number}</span><span className="step-label"><strong>{step.label}</strong><small>{current ? 'In progress' : complete ? 'Complete' : step.helper}</small></span></button>;
              })}
            </nav>
            <div className="rail-note"><LockKeyhole size={17} /><span>Your information is handled with care and never sold.</span></div>
          </aside>
          <div className="main-panel">
            {saved ? <div className="success-state"><span className="success-icon"><Check size={28} /></span><p className="eyebrow">You're all set</p><h1>AssiStar is ready for you.</h1><p className="intro-copy">Your selected reading tools will be available whenever you visit a supported medical website.</p><button className="primary-button" onClick={() => setSaved(false)}>Review setup <ArrowRight size={18} /></button></div> : <>{renderStepContent()}<div className="panel-footer"><button className="back-button" onClick={goBack} disabled={currentIndex === 0}><ChevronLeft size={17} /> Back</button><span className="footer-hint">{activeStep === 'records' && files.length === 0 ? 'You can skip this step' : `${selectedExtensions.length} tools selected`}</span><button className="primary-button" onClick={goForward}>{currentIndex === steps.length - 1 ? 'Finish setup' : 'Save & continue'}<ChevronRight size={18} /></button></div></>}
          </div>
        </div>
      </main>
      <div className="star-helper" title="AssiStar reading tools"><Sparkles size={19} /></div>
      <footer><span>© 2026 AssiStar</span><span>Built for clearer care</span></footer>
    </div>
  );
}

export default App;
