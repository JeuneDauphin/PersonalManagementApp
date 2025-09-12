import React, { useState, useMemo } from 'react';
import ToggleSwitch from './ToggleSwitch';
import Notification from './Notification';

// UI-only Settings page (no persistence). All state is ephemeral.
// Provides notification preference toggles and language selector.
// You can mount this component in a route or popup as needed.

const languageLabels = {
	en: 'English',
	fr: 'Français',
	es: 'Español',
	de: 'Deutsch'
} as const;

type Lang = keyof typeof languageLabels;

const translations: Record<Lang, {
	title: string;
	notificationSection: string;
	languageSection: string;
	masterToggle: string;
	soundToggle: string;
	desktopToggle: string;
	emailToggle: string;
	categories: string;
	tasks: string; events: string; projects: string; lessons: string; tests: string;
	preview: string; reset: string; info: string; uiOnly: string; languageLabel: string; sample: string;
}> = {
	en: {
		title: 'Application Settings',
		notificationSection: 'Notification Preferences',
		languageSection: 'Language',
		masterToggle: 'Enable Notifications',
		soundToggle: 'Sound',
		desktopToggle: 'Desktop Popups',
		emailToggle: 'Email Summaries',
		categories: 'Content Categories',
		tasks: 'Tasks', events: 'Events', projects: 'Projects', lessons: 'Lessons', tests: 'Tests',
		preview: 'Preview Notification',
		reset: 'Reset to Defaults',
		info: 'Changes are not saved — UI demo only.',
		uiOnly: 'UI-Only (no backend / storage)',
		languageLabel: 'Select Language',
		sample: 'Sample phrase'
	},
	fr: {
		title: 'Paramètres de l\'application',
		notificationSection: 'Préférences de notifications',
		languageSection: 'Langue',
		masterToggle: 'Activer les notifications',
		soundToggle: 'Son',
		desktopToggle: 'Popups bureau',
		emailToggle: 'Récap email',
		categories: 'Catégories',
		tasks: 'Tâches', events: 'Événements', projects: 'Projets', lessons: 'Cours', tests: 'Tests',
		preview: 'Prévisualiser',
		reset: 'Réinitialiser',
		info: 'Modifications non sauvegardées — démonstration UI uniquement.',
		uiOnly: 'Interface seulement (pas de stockage)',
		languageLabel: 'Choisir la langue',
		sample: 'Phrase exemple'
	},
	es: {
		title: 'Configuración de la aplicación',
		notificationSection: 'Preferencias de notificación',
		languageSection: 'Idioma',
		masterToggle: 'Habilitar notificaciones',
		soundToggle: 'Sonido',
		desktopToggle: 'Ventanas emergentes',
		emailToggle: 'Resúmenes por correo',
		categories: 'Categorías',
		tasks: 'Tareas', events: 'Eventos', projects: 'Proyectos', lessons: 'Lecciones', tests: 'Exámenes',
		preview: 'Previsualizar',
		reset: 'Restablecer',
		info: 'Cambios no guardados — solo demostración UI.',
		uiOnly: 'Solo UI (sin almacenamiento)',
		languageLabel: 'Seleccionar idioma',
		sample: 'Frase de ejemplo'
	},
	de: {
		title: 'Anwendungseinstellungen',
		notificationSection: 'Benachrichtigungseinstellungen',
		languageSection: 'Sprache',
		masterToggle: 'Benachrichtigungen aktivieren',
		soundToggle: 'Ton',
		desktopToggle: 'Desktop-Popups',
		emailToggle: 'E-Mail-Zusammenfassungen',
		categories: 'Kategorien',
		tasks: 'Aufgaben', events: 'Ereignisse', projects: 'Projekte', lessons: 'Lektionen', tests: 'Tests',
		preview: 'Vorschau',
		reset: 'Zurücksetzen',
		info: 'Änderungen nicht gespeichert — nur UI-Demo.',
		uiOnly: 'Nur Oberfläche (kein Speicher)',
		languageLabel: 'Sprache wählen',
		sample: 'Beispielsatz'
	}
};

const samplePhrases: Record<Lang, string> = {
	en: 'Focus and productivity in one place',
	fr: 'Concentration et productivité réunies',
	es: 'Enfoque y productividad en un solo lugar',
	de: 'Fokus und Produktivität an einem Ort'
};

const Settings: React.FC = () => {
	// Notification state (ephemeral)
	const [enabled, setEnabled] = useState(true);
	const [sound, setSound] = useState(true);
	const [desktop, setDesktop] = useState(true);
	const [email, setEmail] = useState(false);
	const [categories, setCategories] = useState({
		tasks: true,
		events: true,
		projects: true,
		lessons: false,
		tests: false
	});
	const [lang, setLang] = useState<Lang>('en');
	const [showPreview, setShowPreview] = useState(false);

	const t = translations[lang];

	const allCategoriesOn = useMemo(() => Object.values(categories).every(Boolean), [categories]);
	const anyCategoryOn = useMemo(() => Object.values(categories).some(Boolean), [categories]);

	const toggleCategory = (key: keyof typeof categories) => {
		setCategories(prev => ({ ...prev, [key]: !prev[key] }));
	};

	const setAllCategories = (value: boolean) => {
		setCategories({ tasks: value, events: value, projects: value, lessons: value, tests: value });
	};

	const handleReset = () => {
		setEnabled(true);
		setSound(true);
		setDesktop(true);
		setEmail(false);
		setCategories({ tasks: true, events: true, projects: true, lessons: false, tests: false });
		setLang('en');
	};

	const openPreview = () => {
		setShowPreview(true);
		setTimeout(() => setShowPreview(false), 3000);
	};

	return (
		<div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-h1 font-semibold text-white">{t.title}</h1>
				<p className="text-gray-400 text-body flex items-center gap-2">
					<span className="px-2 py-0.5 rounded bg-blue-700/30 text-blue-300 text-small">{t.uiOnly}</span>
					{t.info}
				</p>
			</header>

			{/* Notification Preferences */}
			<section className="bg-gray-800 rounded-lg border border-gray-700 shadow p-5 md:p-6 space-y-6">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div>
						<h2 className="text-large font-medium text-white">{t.notificationSection}</h2>
						<p className="text-sm text-gray-400">{anyCategoryOn ? 'Active channels configured' : 'No category enabled'}</p>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm text-gray-300">{t.masterToggle}</span>
						<ToggleSwitch isOn={enabled} onToggle={() => setEnabled(v => !v)} />
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Delivery Options */}
					<div className="space-y-4">
						<h3 className="text-body font-medium text-gray-300">Delivery</h3>
						<ul className="space-y-3">
							<li className="flex items-center justify-between gap-4">
								<div className="flex flex-col">
									<span className="text-sm text-gray-200">{t.soundToggle}</span>
									<span className="text-xs text-gray-500">Play a sound for incoming notifications</span>
								</div>
								<ToggleSwitch isOn={sound && enabled} onToggle={() => setSound(v => !v)} />
							</li>
							<li className="flex items-center justify-between gap-4">
								<div className="flex flex-col">
									<span className="text-sm text-gray-200">{t.desktopToggle}</span>
									<span className="text-xs text-gray-500">Show popup toast on screen</span>
								</div>
								<ToggleSwitch isOn={desktop && enabled} onToggle={() => setDesktop(v => !v)} />
							</li>
							<li className="flex items-center justify-between gap-4">
								<div className="flex flex-col">
									<span className="text-sm text-gray-200">{t.emailToggle}</span>
									<span className="text-xs text-gray-500">Digest style summary (demo only)</span>
								</div>
								<ToggleSwitch isOn={email && enabled} onToggle={() => setEmail(v => !v)} />
							</li>
						</ul>
						<div className="flex items-center gap-2 pt-2">
							<button
								type="button"
								onClick={openPreview}
								disabled={!enabled}
								className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium transition"
							>{t.preview}</button>
							<button
								type="button"
								onClick={handleReset}
								className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium transition"
							>{t.reset}</button>
						</div>
					</div>

					{/* Categories */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-body font-medium text-gray-300">{t.categories}</h3>
								<button
									type="button"
									onClick={() => setAllCategories(!allCategoriesOn)}
									className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
								>{allCategoriesOn ? 'Disable all' : 'Enable all'}</button>
							</div>
							<ul className="space-y-3">
								{Object.entries(categories).map(([key, value]) => (
									<li key={key} className="flex items-center justify-between gap-4">
										<span className="text-sm text-gray-200 capitalize">{(t as any)[key]}</span>
										<ToggleSwitch
											isOn={value && enabled}
											onToggle={() => toggleCategory(key as keyof typeof categories)}
										/>
									</li>
								))}
							</ul>
						</div>
				</div>
			</section>

			{/* Language Section */}
			<section className="bg-gray-800 rounded-lg border border-gray-700 shadow p-5 md:p-6 space-y-6">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div>
						<h2 className="text-large font-medium text-white">{t.languageSection}</h2>
						<p className="text-sm text-gray-400">{t.languageLabel}</p>
					</div>
					<div>
						<select
							value={lang}
							onChange={e => setLang(e.target.value as Lang)}
							className="px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm focus:ring-2 focus:ring-blue-500"
						>
							{Object.entries(languageLabels).map(([code, label]) => (
								<option key={code} value={code}>{label}</option>
							))}
						</select>
					</div>
				</div>
				<div className="bg-gray-900/40 border border-gray-700 rounded-lg p-4 flex flex-col gap-2">
					<span className="text-xs uppercase tracking-wide font-medium text-gray-400">{t.sample}</span>
					<p className="text-gray-200 text-sm">{samplePhrases[lang]}</p>
					<p className="text-xs text-gray-500">Preview labels update instantly when you change the language (no persistence).</p>
				</div>
			</section>

			{/* Live Preview Notification */}
			<Notification
				type="info"
				title={t.preview}
				message={samplePhrases[lang]}
				isOpen={showPreview && enabled}
				onClose={() => setShowPreview(false)}
				duration={2500}
			/>
		</div>
	);
};

export default Settings;

