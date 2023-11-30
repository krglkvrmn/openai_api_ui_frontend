import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';


function CodeBlockComponent(
    props: any
    ) {
    const {children, className, node, ...rest} = props;
    const match = /language-(\w+)/.exec(className || '');
    if (typeof rest.inline === "boolean") {
        rest.inline = rest.inline.toString();
    }
    return match ? (
        <SyntaxHighlighter
            style={dark}
            language={match[1]}
            PreTag="div"
            children={String(children).replace(/\n$/, '')}
            {...rest}/>
            
        ) : (
            <code className={className} {...rest}>
                {children}
            </code>
        )
}



export default function Message(
    {author, content}:
    {author: string, content: string}
    ) {
    return (
        <div className="message-container">
            <b>Author: {author}</b>
            <ReactMarkdown components={{
                code: CodeBlockComponent
            }}>
                {content}
            </ReactMarkdown>
        </div>
    )
}