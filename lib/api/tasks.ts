import { createClient } from '@/lib/supabase/client';
import type {
  Task,
  TaskWithDetails,
  CreateTaskInput,
  UpdateTaskInput,
  TaskComment,
  CreateCommentInput,
  UpdateCommentInput,
  TaskActivity,
  TaskAction,
  TaskFilters,
} from '@/lib/types/database';

const supabase = createClient();
import { createNotificationsForUsers } from './notifications';
import { sendDiscordNotification } from '@/lib/integrations/discord';
import { sendTaskAssignedEmail, sendTaskCreatedEmail } from '../actions/email-notifications';
import { logger } from '../logger';

/**
 * Fetch all tasks for a column
 */
export async function getColumnTasks(columnId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('column_id', columnId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single task with details
 */
export async function getTask(taskId: string): Promise<TaskWithDetails> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      comments:task_comments(*),
      activity:task_activity(*)
    `)
    .eq('id', taskId)
    .single();

  if (error) throw error;

  // Sort comments and activity by created_at
  if (data.comments) {
    data.comments.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }
  if (data.activity) {
    data.activity.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return data;
}

/**
 * Create a new task
 */
export async function createTask(
  input: CreateTaskInput,
  userId: string,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...input,
      created_by: userId,
      priority: input.priority || 'Medium',
      assigned_to: input.assigned_to || [],
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await logTaskActivity(data.id, userId, 'created', {
    title: data.title,
  });

  // Notify assignees
  if (data.assigned_to && data.assigned_to.length > 0) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user?.id || '')
        .single();
      const creatorName = creatorProfile?.username || 'Someone';

      const notifications = await createNotificationsForUsers(
        data.assigned_to,
        {
          type: 'task_assigned',
          title: `Task assigned to you`,
          message: `${creatorName} assigned you to: ${data.title}`,
          link: `/boards/${data.board_id}?task=${data.id}`,
          priority:
            data.priority === 'Urgent' || data.priority === 'High'
              ? 'high'
              : 'normal',
          task_id: data.id,
          board_id: data.board_id,
        },
      );

      const { data: discordProfiles } = await supabase
        .from('profiles')
        .select('id, username, discord_id')
        .in('id', data.assigned_to);

      const usersWithDiscord =
        discordProfiles
          ?.filter((p: any) => p.discord_id)
          .map((p: any) => ({
            discord_id: p.discord_id as string,
            username: p.username as string,
          })) || [];

      if (usersWithDiscord.length > 0 && notifications.length > 0) {
        await sendDiscordNotification({
          notificationId: notifications[0].id,
          type: 'task_assigned',
          title: `Task assigned`,
          message: data.title,
          link: `/boards/${data.board_id}?task=${data.id}`,
          priority:
            data.priority === 'Urgent' || data.priority === 'High'
              ? 'high'
              : 'normal',
          users: usersWithDiscord,
        });
      }
            if (user?.email) {
        await sendTaskCreatedEmail(data.id, user.id, user.email);  
        }

    } catch (error) {
      logger.error('Failed to send notifications (task create):', error);
    }
  }
  

  return data;
}


/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
  userId: string
): Promise<Task> {
  const { data: oldTask } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  const updateData: any = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  // Handle completion
  if (input.is_completed !== undefined && input.is_completed) {
    updateData.completed_at = new Date().toISOString();
    updateData.completed_by = userId;
  } else if (input.is_completed === false) {
    updateData.completed_at = null;
    updateData.completed_by = null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  // Log activity based on what changed
  if (oldTask && input.column_id && oldTask.column_id !== input.column_id) {
    await logTaskActivity(taskId, userId, 'moved', {
      from_column: oldTask.column_id,
      to_column: input.column_id,
    });
  } else if (input.is_completed) {
    await logTaskActivity(taskId, userId, 'completed', {});
  } else {
    await logTaskActivity(taskId, userId, 'updated', {
      fields: Object.keys(input),
    });
  }

  // Notify on task moved
  if (oldTask && input.column_id && oldTask.column_id !== input.column_id && data.assigned_to && data.assigned_to.length > 0) {
    try {
      const { data: oldColumn } = await supabase.from('task_columns').select('title').eq('id', oldTask.column_id).single();
      const { data: newColumn } = await supabase.from('task_columns').select('title').eq('id', input.column_id).single();

      const notifications = await createNotificationsForUsers(data.assigned_to, {
        type: 'task_moved',
        title: `Task moved`,
        message: `${data.title} moved from ${oldColumn?.title || 'Unknown'} to ${newColumn?.title || 'Unknown'}`,
        link: `/boards/${data.board_id}?task=${data.id}`,
        priority: data.priority === 'Urgent' || data.priority === 'High' ? 'high' : 'normal',
        task_id: data.id,
        board_id: data.board_id,
      });

      const { data: profiles } = await supabase.from('profiles').select('id, username, discord_id').in('id', data.assigned_to);
      const usersWithDiscord = profiles?.filter((p: any) => p.discord_id).map((p: any) => ({ discord_id: p.discord_id!, username: p.username })) || [];

      if (usersWithDiscord.length > 0 && notifications.length > 0) {
        await sendDiscordNotification({
          notificationId: notifications[0].id,
          type: 'task_moved',
          title: `Task moved`,
          message: `${data.title} moved to ${newColumn?.title || 'Unknown'}`,
          link: `/boards/${data.board_id}?task=${data.id}`,
          priority: data.priority === 'Urgent' || data.priority === 'High' ? 'high' : 'normal',
          users: usersWithDiscord,
        });
      }
    } catch (error) {
      logger.error('Failed to send notifications:', error);
    }
  }
  
  // Notify on task completed
  else if (input.is_completed && !oldTask?.is_completed && data.assigned_to && data.assigned_to.length > 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const notifyIds = data.assigned_to.filter((id: string) => id !== user?.id);
      
      if (notifyIds.length > 0) {
        const { data: completerProfile } = await supabase.from('profiles').select('username').eq('id', user?.id || '').single();
        const completerName = completerProfile?.username || 'Someone';
        
        const notifications = await createNotificationsForUsers(notifyIds, {
          type: 'task_moved',
          title: `Task marked as complete`,
          message: `${completerName} completed: ${data.title}`,
          link: `/boards/${data.board_id}?task=${data.id}`,
          priority: 'normal',
          task_id: data.id,
          board_id: data.board_id,
        });

        const { data: profiles } = await supabase.from('profiles').select('id, username, discord_id').in('id', notifyIds);
        const usersWithDiscord = profiles?.filter((p: any) => p.discord_id).map((p: any) => ({ discord_id: p.discord_id!, username: p.username })) || [];

        if (usersWithDiscord.length > 0 && notifications.length > 0) {
          await sendDiscordNotification({
            notificationId: notifications[0].id,
            type: 'task_moved',
            title: `Task completed`,
            message: data.title,
            link: `/boards/${data.board_id}?task=${data.id}`,
            priority: 'normal',
            users: usersWithDiscord,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to send task completion notifications:', error);
    }
  }
  
  // Notify on assignee changes
  else if (input.assigned_to && oldTask?.assigned_to) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const oldAssignees = oldTask.assigned_to || [];
      const newAssignees = input.assigned_to.filter((id: string) => !oldAssignees.includes(id));
      const removedAssignees = oldAssignees.filter((id: string) => !input.assigned_to!.includes(id));
      
     
      // Notify newly added assignees
      if (newAssignees.length > 0) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: assignerProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user?.id || '')
          .single();
        const assignerName = assignerProfile?.username || 'Someone';

        const notifications = await createNotificationsForUsers(
          newAssignees,
          {
            type: 'task_assigned',
            title: `Task assigned to you`,
            message: `${assignerName} assigned you to: ${data.title}`,
            link: `/boards/${data.board_id}?task=${data.id}`,
            priority:
              data.priority === 'Urgent' || data.priority === 'High'
                ? 'high'
                : 'normal',
            task_id: data.id,
            board_id: data.board_id,
          },
        );

        const { data: discordProfiles } = await supabase
          .from('profiles')
          .select('id, username, discord_id')
          .in('id', newAssignees);

        const usersWithDiscord =
          discordProfiles
            ?.filter((p: any) => p.discord_id)
            .map((p: any) => ({
              discord_id: p.discord_id as string,
              username: p.username as string,
            })) || [];

        if (usersWithDiscord.length > 0 && notifications.length > 0) {
          await sendDiscordNotification({
            notificationId: notifications[0].id,
            type: 'task_assigned',
            title: `Task assigned`,
            message: `${assignerName} assigned task: ${data.title}`,
            link: `/boards/${data.board_id}?task=${data.id}`,
            priority:
              data.priority === 'Urgent' || data.priority === 'High'
                ? 'high'
                : 'normal',
            users: usersWithDiscord,
          });
        }
      }

      try{
        sendTaskAssignedEmail(taskId, newAssignees)
      }catch(error){
         logger.error("Failed to send email notification:", error);
      }

    } catch (error) {
      logger.error('Failed to send assignee change notifications:', error);
    }
  }
  
  // Notify on deadline changes
  else if (input.due_date && oldTask?.due_date !== input.due_date && data.assigned_to && data.assigned_to.length > 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const notifyIds = data.assigned_to.filter((id: string) => id !== user?.id);
      
      if (notifyIds.length > 0) {
        const { data: changerProfile } = await supabase.from('profiles').select('username').eq('id', user?.id || '').single();
        const changerName = changerProfile?.username || 'Someone';
        
        const formattedDate = new Date(input.due_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        
        const notifications = await createNotificationsForUsers(notifyIds, {
          type: 'task_deadline',
          title: `Task deadline changed`,
          message: `${changerName} changed deadline of "${data.title}" to ${formattedDate}`,
          link: `/boards/${data.board_id}?task=${data.id}`,
          priority: 'normal',
          task_id: data.id,
          board_id: data.board_id,
        });

        const { data: profiles } = await supabase.from('profiles').select('id, username, discord_id').in('id', notifyIds);
        const usersWithDiscord = profiles?.filter((p: any) => p.discord_id).map((p: any) => ({ discord_id: p.discord_id!, username: p.username })) || [];

        if (usersWithDiscord.length > 0 && notifications.length > 0) {
          await sendDiscordNotification({
            notificationId: notifications[0].id,
            type: 'task_deadline',
            title: `Deadline changed`,
            message: `${changerName} changed deadline: ${data.title}`,
            link: `/boards/${data.board_id}?task=${data.id}`,
            priority: 'normal',
            users: usersWithDiscord,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to send deadline change notifications:', error);
    }
  }

  return data;
}

/**
 * Move a task to a different column
 */
export async function moveTask(
  taskId: string,
  columnId: string,
  position: number,
  userId: string
): Promise<Task> {
  return updateTask(
    taskId,
    { column_id: columnId, position },
    userId
  );
}

/**
 * Delete a task (hard delete, cascades to comments and activity)
 */
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

/**
 * Get the next position for a new task in a column
 */
export async function getNextTaskPosition(columnId: string): Promise<number> {
  const { data, error } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data ? data.position + 1000 : 1000;
}

/**
 * Reorder tasks within or across columns
 */
export async function reorderTasks(
  updates: Array<{ id: string; column_id: string; position: number }>
): Promise<void> {
  // Update each task individually
  const updatePromises = updates.map(({ id, column_id, position }) =>
    supabase
      .from('tasks')
      .update({ column_id, position })
      .eq('id', id)
  );

  const results = await Promise.all(updatePromises);
  
  const error = results.find(r => r.error)?.error;
  if (error) throw error;
}

/**
 * Get tasks with filters
 */
export async function getFilteredTasks(
  boardId: string,
  filters: TaskFilters
): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId);

  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters.assigned_to) {
    query = query.contains('assigned_to', [filters.assigned_to]);
  }
  if (filters.is_completed !== undefined) {
    query = query.eq('is_completed', filters.is_completed);
  }
  if (filters.has_due_date) {
    query = query.not('due_date', 'is', null);
  }
  if (filters.overdue) {
    query = query.lt('due_date', new Date().toISOString());
    query = query.eq('is_completed', false);
  }

  const { data, error } = await query.order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ============================================
// COMMENTS
// ============================================

/**
 * Create a task comment
 */
export async function createComment(
  input: CreateCommentInput,
  userId: string
): Promise<TaskComment> {
  const { data, error } = await supabase
    .from('task_comments')
    .insert({
      ...input,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await logTaskActivity(input.task_id, userId, 'commented', {
    comment_preview: input.content.substring(0, 50),
  });

  return data;
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  input: UpdateCommentInput
): Promise<TaskComment> {
  const { data, error } = await supabase
    .from('task_comments')
    .update({
      ...input,
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a comment (hard delete)
 */
export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

// ============================================
// ACTIVITY LOGGING
// ============================================

/**
 * Log a task activity
 */
export async function logTaskActivity(
  taskId: string,
  userId: string,
  action: TaskAction,
  details: Record<string, any>
): Promise<TaskActivity> {
  const { data, error } = await supabase
    .from('task_activity')
    .insert({
      task_id: taskId,
      user_id: userId,
      action,
      details,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get task activity log
 */
export async function getTaskActivity(taskId: string): Promise<TaskActivity[]> {
  const { data, error } = await supabase
    .from('task_activity')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}