import styled from 'styled-components'

export const Container = styled.div`
  box-shadow: 0px 6px 5px -3px rgba(0, 0, 0, 0nc-1);
  background-color: var(--nc-background, white);
  color: var(--nc-text-color, #888);
  padding: 18px;
  border-radius: 8px;
  font-family: arial;
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

export const Notice = styled.div`
  color: var(--nc-primary-contrast, white);
  padding: 4px;
  text-align: center;
  background: var(--nc-primary-color, #0d6efd);
  color: white;
  margin: 8px;
`

export const CommentCard = styled.div`
  padding: 0px;
  margin: 0px;
  padding-top: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`

export const CommentTitle = styled.span`
  color: var(--nc-text-color-dark, #222);
`

export const Textarea = styled.textarea`
  background-color: var(--nc-text-background, white);
  color: var(--nc-text-color, black);
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
