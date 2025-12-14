import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'app-avatar',
    template: `
    <div [ngClass]="classes" [style.backgroundColor]="bgColor" class="flex items-center justify-center rounded-full text-white font-bold uppercase select-none">
      {{ initial }}
    </div>
  `,
    styles: []
})
export class AvatarComponent implements OnChanges {
    @Input() name: string = '';
    @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

    initial: string = '';
    bgColor: string = '#3b82f6'; // Default blue
    classes: string = '';

    private colors = [
        '#ef4444', // red-500
        '#f97316', // orange-500
        '#f59e0b', // amber-500
        '#84cc16', // lime-500
        '#22c55e', // green-500
        '#10b981', // emerald-500
        '#14b8a6', // teal-500
        '#06b6d4', // cyan-500
        '#0ea5e9', // sky-500
        '#3b82f6', // blue-500
        '#6366f1', // indigo-500
        '#8b5cf6', // violet-500
        '#a855f7', // purple-500
        '#d946ef', // fuchsia-500
        '#ec4899', // pink-500
        '#f43f5e'  // rose-500
    ];

    ngOnChanges() {
        this.initial = this.name ? this.name.charAt(0) : '?';
        this.bgColor = this.getColorFromName(this.name);
        this.classes = this.getSizeClasses(this.size);
    }

    private getColorFromName(name: string): string {
        if (!name) return '#9ca3af'; // gray-400
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % this.colors.length);
        return this.colors[index];
    }

    private getSizeClasses(size: string): string {
        switch (size) {
            case 'xs': return 'w-6 h-6 text-xs';
            case 'sm': return 'w-8 h-8 text-sm';
            case 'md': return 'w-10 h-10 text-base';
            case 'lg': return 'w-12 h-12 text-lg';
            case 'xl': return 'w-16 h-16 text-2xl';
            default: return 'w-10 h-10 text-base';
        }
    }
}
