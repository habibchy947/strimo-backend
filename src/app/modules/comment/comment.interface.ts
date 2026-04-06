export interface ICreateCommentPayload {
  content: string;
  parentId?: string;
}

export interface IUpdateCommentPayload {
  content?: string;
}


