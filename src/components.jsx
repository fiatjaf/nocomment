import styled from 'styled-components'

export const Container = styled.div`
  box-shadow: 0px 6px 5px -3px rgba(0, 0, 0, 0nc-1);
  background-color: var(--nc-background, white);
  color: var(--nc-text-color, #888);
  padding: 18px;
  border-radius: 8px;
  font-family: var(--nc-container-font-family, arial);
  font-size: var(--nc-container-font-size, 1.2em);
  text-align: left;
  width: 100%;
`

export const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 8px;
  border: 1px solid var(--nc-primary-color, #0d6efd);
  border-radius: 4px;
  position: relative;
`

export const InputSectionRow2 = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  justify-content: flex-end;
  width: 100%;
`

export const InfoButton = styled.button`
  background: var(--nc-background, white);
  color: var(--nc-primary-contrast, white);
  cursor: pointer;
  border: 1px solid var(--nc-background, white);
  padding: 8px;
  border-radius: 4px;

  &:hover {
    color: var(--nc-primary-color, #0d6efd);
    border: 1px solid var(--nc-primary-color, #0d6efd);
  }
`

export const SvgInfo = styled.svg`
  fill: var(--nc-primary-color, #0d6efd);
`

export const PostButton = styled.button`
  background: var(--nc-primary-color, #0d6efd);
  color: var(--nc-primary-contrast, white);
  cursor: pointer;
  border: 1px solid var(--nc-background, white);
  padding: 8px;
  border-radius: 4px;
  flex: none;

  &:hover {
    color: var(--nc-primary-color, #0d6efd);
    border: 1px solid var(--nc-primary-color, #0d6efd);
    background: var(--nc-background, white);
  }
`

export const GhostButton = styled.button`
  background: var(--nc-ghost-background, transparent);
  color: var(--nc-text-color, black);
  min-width: 25px;
  min-height: 25px;
  border: none;

  cursor: pointer;
  margin: 0 8px;
  &:hover {
    color: var(--nc-text-color, #222);
  }
`

export const Notices = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const Notice = styled.div`
  color: var(--nc-primary-contrast, white);
  padding: 4px;
  text-align: center;
  background: var(--nc-primary-color, #0d6efd);
  border-radius: 2px;
  color: white;
  margin: 8px;
  width: 100%;
  justify-self: center;
`

export const ReplyWrap = styled.div`
  padding-top: 16px;
`

export const CommentCard = styled.div`
  padding: 0px;
  margin: 0px;
  padding-top: 12px;
  white-space: pre-wrap;

  &:not(:nth-last-of-type(1)) {
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
  }
`

export const CommentTitle = styled.span`
  color: var(--nc-text-color-dark, #222);
`

export const CommentAuthorImage = styled.img`
  height: 1em;
  display: inline;
  margin-right: 4px;
`

export const CommentAuthor = styled.a`
  font-size: var(--nc-comment-author-font-size, 1.2em);
  font-family: var(--nc-comment-author-font-family, monospace);
  text-decoration: var(--nc-link-text-decor, none);
  color: var(--nc-comment-author-font-color, inherit);
  font-weight: bold;

  &:hover {
    text-decoration: var(--nc-link-text-decor-hover, underline);
  }
`

export const CommentDate = styled.a`
  text-decoration: var(--nc-link-text-decor, none);
  color: var(--nc-comment-date-color, inherit);
  font-family: var(--nc-comment-date-font-family, sans-serif);
  font-size: var(--nc-comment-date-font-size, 0.7em);

  &:hover {
    text-decoration: var(--nc-link-text-decor-hover, underline);
  }
`

export const CommentContent = styled.div`
  margin-top: 8px;
  max-height: 306px;
  overflow-y: auto;
`

export const Textarea = styled.textarea`
  background-color: var(--nc-text-background, white);
  color: var(--nc-text-color, black);
  font-family: var(--nc-textarea-font-family, inherit);
  font-size: var(--nc-textarea-font-size, inherit);
  border: none;
  outline: none;
  width: 100%;
  padding: 5px 6px;
  margin-bottom: 12px;
  height: 96px;

  &:focus {
    border: 0;
    box-shadow: none;
  }
`

export const Info = styled.div`
  padding: 8px;
  margin-top: 4px;
  width: 100%;
`
