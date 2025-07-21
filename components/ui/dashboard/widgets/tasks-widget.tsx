"use client";

import { useState } from 'react';
import { WidgetBase } from '../widget-base';
import { WidgetSize } from '@/lib/types/dashboard-widget';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../dialog';
import { Button } from '../../button';
import { useDashboard } from '@/lib/contexts/dashboard-context';
import { Checkbox } from '../../checkbox';
import { Input } from '../../input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../select';
import { PlusCircle, Clock, CalendarIcon } from 'lucide-react';

interface TasksWidgetProps {
  id: string;
  size: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export function TasksWidget({ id, size }: TasksWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { updateWidgetSettings } = useDashboard();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTask, setNewTask] = useState('');
  
  // Sample tasks for demonstration
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Prepare Sunday sermon', completed: false, dueDate: '2025-07-21', priority: 'high' },
    { id: '2', title: 'Contact new members', completed: false, dueDate: '2025-07-22', priority: 'medium' },
    { id: '3', title: 'Review worship songs', completed: true, dueDate: '2025-07-19', priority: 'medium' },
    { id: '4', title: 'Organize youth event', completed: false, dueDate: '2025-07-25', priority: 'high' },
    { id: '5', title: 'Update church website', completed: false, dueDate: '2025-07-23', priority: 'low' },
  ]);

  const handleSaveSettings = () => {
    updateWidgetSettings(id, { filter });
    setShowSettings(false);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.trim(),
        completed: false,
        dueDate: undefined,
        priority: 'medium'
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Sort tasks by priority and completion status
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <WidgetBase 
        id={id} 
        title="Ministry Tasks" 
        size={size as WidgetSize}
        hasSettings={true}
        onSettingsClick={() => setShowSettings(true)}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Add a new task..." 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Button size="sm" onClick={addTask}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {sortedTasks.length > 0 ? (
              sortedTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex items-start space-x-2 p-2 rounded-md ${task.completed ? 'bg-muted/20' : 'bg-muted/30'}`}
                >
                  <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                      {task.dueDate && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span>{task.dueDate}</span>
                        </div>
                      )}
                      <div className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No tasks to display</p>
              </div>
            )}
          </div>
        </div>
      </WidgetBase>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tasks Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="filter" className="text-sm font-medium">
                Filter Tasks
              </label>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger id="filter">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending Tasks</SelectItem>
                  <SelectItem value="completed">Completed Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}