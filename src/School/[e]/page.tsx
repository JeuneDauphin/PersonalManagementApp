// Lesson detail page: view a single lesson by ID with Theory/Practice/Test tabs,
// optional PDF per tab, and per-tab notes saved to localStorage.
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../Components/Layout/Layout';
import PdfReader from '../../Components/UI/PdfReader';
import { apiService } from '../../utils/api/Api';
import type { Lesson } from '../../utils/interfaces/interfaces';

type LessonView = 'theory' | 'practice' | 'test';

const VIEW_LABELS: Record<LessonView, string> = {
    theory: 'Theory',
    practice: 'Practice',
    test: 'Test',
};

const Page: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // View state (persist last viewed tab per lesson)
    const initialView = useMemo<LessonView>(() => {
        if (!id) return 'theory';
        const saved = localStorage.getItem(`lesson:view:${id}`) as LessonView | null;
        return saved === 'theory' || saved === 'practice' || saved === 'test' ? saved : 'theory';
    }, [id]);
    const [view, setView] = useState<LessonView>(initialView);

    useEffect(() => {
        if (id) localStorage.setItem(`lesson:view:${id}`, view);
    }, [id, view]);

    // Per-view notes (persisted)
    const notesKey = (v: LessonView) => (id ? `lesson:notes:${id}:${v}` : '');
    const loadNotes = (v: LessonView) => {
        try {
            const k = notesKey(v);
            return k ? localStorage.getItem(k) || '' : '';
        } catch {
            return '';
        }
    };
    const [notes, setNotes] = useState<Record<LessonView, string>>({
        theory: loadNotes('theory'),
        practice: loadNotes('practice'),
        test: loadNotes('test'),
    });
    const [notesOpen, setNotesOpen] = useState<boolean>(true);

    useEffect(() => {
        if (!id) return;
        // Save current notes snapshot for all views (simple persistence)
        (['theory', 'practice', 'test'] as LessonView[]).forEach(v => {
            try {
                localStorage.setItem(`lesson:notes:${id}:${v}`, notes[v]);
            } catch { }
        });
    }, [id, notes]);

    // Per-view PDF: support either a URL (persisted) or an uploaded File (session only)
    type PdfState = { url: string | null; file: File | null };
    const pdfKey = (v: LessonView) => (id ? `lesson:pdfUrl:${id}:${v}` : '');
    const loadPdfUrl = (v: LessonView) => {
        try {
            const k = pdfKey(v);
            return k ? localStorage.getItem(k) : null;
        } catch {
            return null;
        }
    };
    const [pdfs, setPdfs] = useState<Record<LessonView, PdfState>>({
        theory: { url: loadPdfUrl('theory'), file: null },
        practice: { url: loadPdfUrl('practice'), file: null },
        test: { url: loadPdfUrl('test'), file: null },
    });

    const [showPdf, setShowPdf] = useState<boolean>(false);

    // Fetch lesson by ID
    useEffect(() => {
        const run = async () => {
            if (!id) {
                setError('Missing lesson ID.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await apiService.getLesson(id);
                setLesson(data);
                setError(null);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load lesson');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id]);

    const currentPdf = pdfs[view];
    const resolvedPdfSource: string | File | null = currentPdf.file || currentPdf.url || null;

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.trim() || null;
        setPdfs(prev => ({ ...prev, [view]: { ...prev[view], url: val } }));
        if (id) {
            try {
                const k = pdfKey(view);
                if (k) {
                    if (val) localStorage.setItem(k, val);
                    else localStorage.removeItem(k);
                }
            } catch { }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setPdfs(prev => ({ ...prev, [view]: { ...prev[view], file } }));
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNotes(prev => ({ ...prev, [view]: val }));
    };

    const openPdf = () => {
        if (!resolvedPdfSource) return;
        setShowPdf(true);
    };

    const Header = () => (
        <div className="flex items-center justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    {lesson?.title || 'Lesson'}
                </h1>
                {lesson && (
                    <p className="text-sm text-gray-400">
                        {lesson.subject} • {lesson.type} • {new Date(lesson.date).toLocaleString()}
                    </p>
                )}
            </div>
            <div>
                <button
                    onClick={() => navigate('/school')}
                    className="px-3 py-2 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600"
                >
                    Back to School
                </button>
            </div>
        </div>
    );

    const ViewTabs = () => (
        <div className="flex w-full bg-gray-800 rounded-lg p-1">
            {(['theory', 'practice', 'test'] as LessonView[]).map(v => (
                <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm ${view === v ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                >
                    {VIEW_LABELS[v]}
                </button>
            ))}
        </div>
    );

    return (
        <Layout title="Lesson">
            <div className="space-y-4">
                <Header />

                {loading && (
                    <div className="bg-gray-800 rounded-lg p-4 text-gray-300">Loading lesson…</div>
                )}
                {error && (
                    <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">{error}</div>
                )}

                {!loading && !error && (
                    <>
                        <ViewTabs />

                        {/* Attachment + actions */}
                        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                            <h2 className="text-lg font-medium text-white">{VIEW_LABELS[view]} materials</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-300">Attach PDF by URL (persists)</label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/file.pdf"
                                        value={pdfs[view].url || ''}
                                        onChange={handleUrlChange}
                                        className="w-full rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-300">Or upload PDF (session only)</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        className="w-full text-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    onClick={openPdf}
                                    disabled={!resolvedPdfSource}
                                    className={`px-4 py-2 rounded-md text-white ${resolvedPdfSource ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'
                                        }`}
                                >
                                    Open PDF
                                </button>
                                {!resolvedPdfSource && (
                                    <span className="text-sm text-gray-400">No PDF attached</span>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-gray-800 rounded-lg">
                            <button
                                onClick={() => setNotesOpen(v => !v)}
                                className="w-full flex items-center justify-between px-4 py-3"
                            >
                                <span className="text-white font-medium">Notes for {VIEW_LABELS[view]}</span>
                                <span className="text-gray-400 text-sm">{notesOpen ? 'Hide' : 'Show'}</span>
                            </button>
                            {notesOpen && (
                                <div className="px-4 pb-4">
                                    <textarea
                                        value={notes[view]}
                                        onChange={handleNotesChange}
                                        placeholder={`Write your ${VIEW_LABELS[view].toLowerCase()} notes here…`}
                                        rows={6}
                                        className="w-full rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="mt-2 text-xs text-gray-400">Auto-saved locally.</p>
                                </div>
                            )}
                        </div>

                        {/* Meta */}
                        {lesson && (
                            <div className="bg-gray-800 rounded-lg p-4 text-gray-300 space-y-1">
                                <div><span className="text-gray-400">Subject:</span> {lesson.subject}</div>
                                <div><span className="text-gray-400">Type:</span> {lesson.type}</div>
                                {lesson.location && <div><span className="text-gray-400">Location:</span> {lesson.location}</div>}
                                {lesson.instructor && <div><span className="text-gray-400">Instructor:</span> {lesson.instructor}</div>}
                                {lesson.description && (
                                    <div className="pt-2">
                                        <div className="text-gray-400">Description</div>
                                        <div className="text-gray-200">{lesson.description}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* PDF Modal */}
                {showPdf && resolvedPdfSource && (
                    <PdfReader file={resolvedPdfSource} onClose={() => setShowPdf(false)} />
                )}
            </div>
        </Layout>
    );
};

export default Page;