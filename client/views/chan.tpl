{{#each channels}}
<div
	class="chan {{type}} chan-{{slugify name}}"
	data-id="{{id}}"
	data-target="#chan-{{id}}"
	role="tab"
	aria-label="{{name}}"
	aria-controls="chan-{{id}}"
	aria-selected="false"
>
	<span class="name" title="{{name}}">{{name}}</span>
	<span class="badge{{#if highlight}} highlight{{/if}}">{{#if unread}}{{roundBadgeNumber unread}}{{/if}}</span>
	{{#equal type "lobby"}}
		<span class="add-channel-tooltip tooltipped tooltipped-w tooltipped-no-touch" aria-label="Join a channel…" data-alt-label="Cancel">
			<button class="add-channel" aria-label="Join a channel…" data-id="{{id}}"></button>
		</span>
	{{/equal}}
	{{#notEqual type "lobby"}}
		<span class="close-tooltip tooltipped tooltipped-w" aria-label="Leave">
			<button class="close" aria-label="Leave"></button>
		</span>
	{{/notEqual}}
</div>
{{#equal type "lobby"}}
	{{> join_channel}}
{{/equal}}
{{/each}}
