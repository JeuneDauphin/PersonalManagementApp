// Project detail page: view and edit a single project (replaces popup UX)
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../Components/Layout/Layout';
import Button from '../../Components/UI/Button';
import { Calendar, GitBranch, Link, Tag } from 'lucide-react';
import { apiService } from '../../utils/api/Api';
import type { Project, Task } from '../../utils/interfaces/interfaces';
import type { Priority, ProjectStatus } from '../../utils/types/types';

const ProjectDetailPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const [project, setProject] = useState<Project | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

    const location = useLocation() as any;
    const [isEditing, setIsEditing] = useState<boolean>(!!location.state?.startInEdit);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		status: 'planning' as ProjectStatus,
		priority: 'medium' as Priority,
		startDate: '',
		endDate: '',
		progress: 0,
		tags: [] as string[],
		githubLink: '',
		figmaLink: '',
		mailingList: '',
		tasks: [] as string[],
		collaborators: [] as string[],
	});
	const [tagInput, setTagInput] = useState('');

	// Fetch project
	useEffect(() => {
		const run = async () => {
			if (!id) {
				setError('Missing project ID.');
				setLoading(false);
				return;
			}
			try {
				setLoading(true);
				const data = await apiService.getProject(id);
				setProject(data);
				// fetch tasks linked to project
				try {
					const t = await apiService.getTasksByProject(data._id);
					setTasks(t);
				} catch {
					setTasks([]);
				}
				// hydrate form
				setFormData({
					name: data.name,
					description: data.description,
					status: data.status,
					priority: data.priority,
					startDate: new Date(data.startDate).toISOString().slice(0, 10),
					endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 10) : '',
					progress: data.progress,
					tags: data.tags || [],
					githubLink: data.githubLink || '',
					figmaLink: data.figmaLink || '',
					mailingList: data.mailingList || '',
					tasks: data.tasks || [],
					collaborators: data.collaborators || [],
				});
				setError(null);
			} catch (e) {
				setError(e instanceof Error ? e.message : 'Failed to load project');
			} finally {
                setLoading(false);
			}
		};
		run();

		const onTasksUpdated = (e: Event) => {
			const detail = (e as CustomEvent).detail as { projectId?: string } | undefined;
			if (detail?.projectId && detail.projectId === id) {
				apiService.getTasksByProject(detail.projectId).then(setTasks).catch(() => setTasks([]));
			}
		};
		window.addEventListener('tasksUpdated', onTasksUpdated as EventListener);
		return () => {
			window.removeEventListener('tasksUpdated', onTasksUpdated as EventListener);
		};
	}, [id]);

	const computedProgress = useMemo(() => {
		if (!tasks || tasks.length === 0) return 0;
		const done = tasks.filter(t => t.status === 'completed').length;
		return Math.round((done / tasks.length) * 100);
	}, [tasks]);

	const handleInputChange = (field: string, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
			setTagInput('');
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
	};

	const handleSave = async () => {
		if (!project) return;
		const payload: Partial<Project> = {
			name: formData.name,
			description: formData.description,
			status: formData.status,
			priority: formData.priority,
			startDate: new Date(formData.startDate) as any,
			endDate: formData.endDate ? (new Date(formData.endDate) as any) : undefined,
			progress: formData.progress,
			tags: formData.tags,
			githubLink: formData.githubLink || undefined,
			figmaLink: formData.figmaLink || undefined,
			mailingList: formData.mailingList || undefined,
			tasks: formData.tasks,
			collaborators: formData.collaborators,
		};
		try {
			await apiService.updateProject(project._id, payload);
			// refetch
			const fresh = await apiService.getProject(project._id);
			setProject(fresh);
			setIsEditing(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to save project');
		}
	};

	const handleDelete = async () => {
		if (!project) return;
		try {
			await apiService.deleteProject(project._id);
			navigate('/projects');
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to delete project');
		}
	};

	const getPriorityColor = (priority: Priority) => {
		switch (priority) {
			case 'urgent': return 'text-red-400 bg-red-600';
			case 'high': return 'text-orange-400 bg-orange-600';
			case 'medium': return 'text-yellow-400 bg-yellow-600';
			case 'low': return 'text-green-400 bg-green-600';
			default: return 'text-gray-400 bg-gray-600';
		}
	};

	const getStatusColor = (status: ProjectStatus) => {
		switch (status) {
			case 'planning': return 'text-gray-400';
			case 'active': return 'text-green-400';
			case 'on-hold': return 'text-yellow-400';
			case 'completed': return 'text-blue-400';
			case 'cancelled': return 'text-red-400';
			default: return 'text-gray-400';
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return '';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
			});
		} catch {
			return '';
		}
	};

	return (
		<Layout title="Project">
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-semibold text-white">{project?.name || 'Project'}</h1>
						{project && (
							<div className="flex items-center gap-3 mt-1">
								<span className={`px-3 py-1 rounded-full text-small font-medium ${getStatusColor(project.status)} bg-gray-700`}>
									{project.status.replace('-', ' ').toUpperCase()}
								</span>
								<span className={`px-3 py-1 rounded-full text-small font-medium ${getPriorityColor(project.priority)}`}>
									{project.priority.toUpperCase()}
								</span>
								<span className="text-small text-gray-400">Progress: <span className="text-white font-medium">{computedProgress}%</span></span>
							</div>
						)}
					</div>
					<div className="flex items-center gap-2">
						{!isEditing && (
							<Button text="Back" variant="outline" onClick={() => navigate('/projects')} />
						)}
						{project && !isEditing && (
							<Button text="Edit" variant="outline" onClick={() => setIsEditing(true)} />
						)}
						{project && !isEditing && (
							<Button text="Delete" variant="outline" action="delete" onClick={handleDelete} />
						)}
					</div>
				</div>

				{/* Loading / Error */}
				{loading && <div className="bg-gray-800 rounded-lg p-4 text-gray-300">Loading project…</div>}
				{error && <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">{error}</div>}

				{/* Content */}
				{!loading && !error && (
					<div className="space-y-6">
						{isEditing ? (
							<div className="bg-gray-800 rounded-lg p-4 space-y-4">
								{/* Name */}
								<div>
									<label className="block text-sm text-gray-300 mb-2">Project Name *</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) => handleInputChange('name', e.target.value)}
										className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
										placeholder="Project name"
									/>
								</div>

								{/* Description */}
								<div>
									<label className="block text-sm text-gray-300 mb-2">Description</label>
									<textarea
										value={formData.description}
										onChange={(e) => handleInputChange('description', e.target.value)}
										rows={4}
										className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
										placeholder="Project description"
									/>
								</div>

								{/* Status and Priority */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-gray-300 mb-2">Status</label>
										<select
											value={formData.status}
											onChange={(e) => handleInputChange('status', e.target.value as ProjectStatus)}
											className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
										>
											<option value="planning">Planning</option>
											<option value="active">Active</option>
											<option value="on-hold">On Hold</option>
											<option value="completed">Completed</option>
											<option value="cancelled">Cancelled</option>
										</select>
									</div>
									<div>
										<label className="block text-sm text-gray-300 mb-2">Priority</label>
										<select
											value={formData.priority}
											onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
											className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
										>
											<option value="low">Low</option>
											<option value="medium">Medium</option>
											<option value="high">High</option>
											<option value="urgent">Urgent</option>
										</select>
									</div>
								</div>

								{/* Dates */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-gray-300 mb-2">Start Date *</label>
										<input
											type="date"
											value={formData.startDate}
											onChange={(e) => handleInputChange('startDate', e.target.value)}
											className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-300 mb-2">End Date</label>
										<input
											type="date"
											value={formData.endDate}
											onChange={(e) => handleInputChange('endDate', e.target.value)}
											className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								</div>

								{/* Progress is task-driven; no manual slider here */}

								{/* Links */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-gray-300 mb-2">
											<GitBranch size={16} className="inline mr-2" />
											GitHub Link
										</label>
										<input
											type="url"
											value={formData.githubLink}
											onChange={(e) => handleInputChange('githubLink', e.target.value)}
											className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
											placeholder="https://github.com/..."
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-300 mb-2">
											<Link size={16} className="inline mr-2" />
											Figma Link
										</label>
										<input
											type="url"
											value={formData.figmaLink}
											onChange={(e) => handleInputChange('figmaLink', e.target.value)}
											className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
											placeholder="https://figma.com/..."
										/>
									</div>
								</div>

								{/* Mailing List */}
								<div>
									<label className="block text-sm text-gray-300 mb-2">Mailing List</label>
									<input
										type="email"
										value={formData.mailingList}
										onChange={(e) => handleInputChange('mailingList', e.target.value)}
										className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
										placeholder="project@example.com"
									/>
								</div>

								{/* Tags */}
								<div>
									<label className="block text-sm text-gray-300 mb-2">Tags</label>
									<div className="flex items-center gap-2 mb-2">
										<input
											type="text"
											value={tagInput}
											onChange={(e) => setTagInput(e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
											className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
											placeholder="Add a tag..."
										/>
										<Button text="Add" onClick={handleAddTag} variant="outline" size="sm" />
									</div>
									{formData.tags.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{formData.tags.map((tag, index) => (
												<span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-small">
													<Tag size={12} />
													{tag}
													<button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-white">
														×
													</button>
												</span>
											))}
										</div>
									)}
								</div>

								{/* Actions */}
								<div className="flex items-center justify-end gap-2">
									<Button text="Cancel" variant="outline" onClick={() => setIsEditing(false)} />
									<Button text="Save" variant="primary" onClick={handleSave} disabled={!formData.name.trim()} />
								</div>
							</div>
						) : (
							<div className="space-y-6">
								{/* Progress */}
									{project && tasks.length > 0 && (
									<div className="bg-gray-800 rounded-lg p-4">
										<div className="flex items-center justify-between mb-2">
											<div className="text-small text-gray-400">Progress</div>
												<div className="text-xl font-bold text-white">{computedProgress}%</div>
										</div>
										<div className="w-full bg-gray-700 rounded-full h-2">
												<div className="h-2 rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${computedProgress}%` }} />
										</div>
									</div>
								)}

								{/* Description */}
								{project?.description && (
									<div className="bg-gray-800 rounded-lg p-4">
										<h3 className="text-body font-medium text-gray-300 mb-2">Description</h3>
										<p className="text-body text-gray-400 leading-relaxed">{project.description}</p>
									</div>
								)}

								{/* Dates */}
								<div className="bg-gray-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="flex items-center gap-2">
										<Calendar size={16} className="text-gray-400" />
										<div>
											<div className="text-small text-gray-400">Start Date</div>
											<div className="text-body text-white">{formatDate(project?.startDate?.toString() || '')}</div>
										</div>
									</div>
									{project?.endDate && (
										<div className="flex items-center gap-2">
											<Calendar size={16} className="text-gray-400" />
											<div>
												<div className="text-small text-gray-400">End Date</div>
												<div className="text-body text-white">{formatDate(project.endDate.toString())}</div>
											</div>
										</div>
									)}
								</div>

								{/* Links */}
								{(project?.githubLink || project?.figmaLink) && (
									<div className="bg-gray-800 rounded-lg p-4 space-y-2">
										<h3 className="text-body font-medium text-gray-300">Links</h3>
										<div className="flex flex-wrap gap-3">
											{project.githubLink && (
												<a
													href={project.githubLink}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
												>
													<GitBranch size={16} />
													<span>GitHub</span>
												</a>
											)}
											{project.figmaLink && (
												<a
													href={project.figmaLink}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
												>
													<Link size={16} />
													<span>Figma</span>
												</a>
											)}
										</div>
									</div>
								)}

								{/* Tags */}
								{project?.tags && project.tags.length > 0 && (
									<div className="bg-gray-800 rounded-lg p-4">
										<h3 className="text-body font-medium text-gray-300 mb-2">Tags</h3>
										<div className="flex flex-wrap gap-2">
											{project.tags.map((tag, index) => (
												<span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-small">
													<Tag size={12} />
													{tag}
												</span>
											))}
										</div>
									</div>
								)}

									{/* Tasks */}
									{tasks && (
										<div className="bg-gray-800 rounded-lg p-4">
											<h3 className="text-body font-medium text-gray-300 mb-2">Tasks ({tasks.length})</h3>
											{tasks.length === 0 ? (
												<div className="text-sm text-gray-500">No tasks linked to this project yet.</div>
											) : (
												<ul className="space-y-1">
													{tasks.map(t => (
														<li key={t._id} className="flex items-center justify-between text-sm">
															<span className={`truncate ${t.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-300'}`}>{t.title}</span>
															<span className={`${t.status === 'completed' ? 'text-green-400' : t.status === 'in-progress' ? 'text-blue-400' : 'text-yellow-400'}`}>{t.status.replace('-', ' ')}</span>
														</li>
													))}
												</ul>
											)}
										</div>
									)}

								{/* Stats */}
								{project && (
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="bg-gray-800 rounded-lg p-4 text-center">
											<div className="text-xl font-bold text-white">{project.tasks?.length || 0}</div>
											<div className="text-small text-gray-400">Tasks</div>
										</div>
										<div className="bg-gray-800 rounded-lg p-4 text-center">
											<div className="text-xl font-bold text-white">{project.collaborators?.length || 0}</div>
											<div className="text-small text-gray-400">Collaborators</div>
										</div>
										<div className="bg-gray-800 rounded-lg p-4 text-center">
											<div className="text-xl font-bold text-white">{project.startDate ? Math.ceil((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 3600 * 24)) : 0}</div>
											<div className="text-small text-gray-400">Days Active</div>
										</div>
										<div className="bg-gray-800 rounded-lg p-4 text-center">
											<div className="text-xl font-bold text-white">{project.tags?.length || 0}</div>
											<div className="text-small text-gray-400">Tags</div>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</Layout>
	);
};

export default ProjectDetailPage;

