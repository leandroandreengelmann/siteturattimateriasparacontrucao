import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
    label: string
    href?: string
}

export function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav aria-label="Breadcrumb" className="breadcrumb-nav">
            <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                    <Link href="/" className="breadcrumb-link">
                        <Home size={13} />
                        <span>Início</span>
                    </Link>
                </li>
                {items.map((item, i) => (
                    <li key={i} className="breadcrumb-item">
                        <ChevronRight size={13} className="breadcrumb-sep" />
                        {item.href ? (
                            <Link href={item.href} className="breadcrumb-link">{item.label}</Link>
                        ) : (
                            <span className="breadcrumb-current">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>

            <style>{`
                .breadcrumb-nav {
                    padding: 12px 0;
                }
                .breadcrumb-list {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    flex-wrap: wrap;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .breadcrumb-item {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                }
                .breadcrumb-link {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: var(--muted-foreground, #888);
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .breadcrumb-link:hover { color: var(--foreground, #1a1a1a); }
                .breadcrumb-sep { color: var(--muted-foreground, #ccc); }
                .breadcrumb-current {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: var(--foreground, #1a1a1a);
                }
            `}</style>
        </nav>
    )
}
