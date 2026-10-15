import * as commentsRepo from '../repositories/commentsRepository';

export const getUserComments = async (userId: string) => {
  return await commentsRepo.getUserComments(userId);
};

export const createComment = async (userId: string, bookOlid: string, text: string) => {
  return await commentsRepo.createComment(userId, bookOlid, text);
};

export const updateComment = async (commentId: string, userId: string, text: string) => {
  const comment = await commentsRepo.findCommentById(commentId);
  if (!comment) {
    throw new Error('Комментарий не найден');
  }
  if (comment.user_id !== userId) {
    throw new Error('Можно редактировать только свои комментарии');
  }
  return await commentsRepo.updateComment(commentId, userId, text);
};

export const deleteComment = async (commentId: string, userId: string) => {
  const comment = await commentsRepo.findCommentById(commentId);
  if (!comment) {
    throw new Error('Комментарий не найден');
  }
  if (comment.user_id !== userId) {
    throw new Error('Можно удалять только свои комментарии');
  }
  await commentsRepo.deleteComment(commentId, userId);
};