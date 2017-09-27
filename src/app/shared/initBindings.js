/**
 *
 * @param $el Object - jquery элемент, внутри которого искать элементы, к которым биндиться
 * @param attrName - имя атрибута, по которому искать
 * @param model - модель, к которой биндиться по значению указанного атрибута {attrName}
 */
export function initBindings ($el,attrName,model) {
	if (initBindings.called) return;
	initBindings.called = true;

	const $allBindings = $el.find(`[${attrName}]`);

	$allBindings.each((i,el)=>{
		const $bindingEl = $(el);
		const property = $bindingEl.attr(attrName);

		switch ($bindingEl.prop('nodeName')) {
			case "INPUT":
			case "TEXTAREA":
				model.on(`change:${property}`,(m,value=null,opts)=>{
					switch ($bindingEl.prop('type')) {
						case 'radio':
							$allBindings
								.filter((i,el)=>$(el).prop('name') === $bindingEl.prop('name'))
								.each((i,el)=>$(el).prop('checked',false))
								.filter((i,el)=>$(el).val() == value)
								.each((i,el)=>$(el).prop('checked',true));
							break;
						case 'checkbox':
							$allBindings
								.filter((i,el)=>$(el).prop('name') === $bindingEl.prop('name'))
								.each((i,el)=>$(el).prop('checked',value.includes && value.includes(el.value)));
							break;
						default:
							$bindingEl.val(value);
					}
				});

				const changeCb = (e)=>{
					const val = (()=>{
						switch ($bindingEl.prop('type')) {
							case "checkbox":
								return $allBindings
									.filter((i,el)=>{
										return $(el).prop('name') === $bindingEl.prop('name') && $(el).prop('checked')
									})
									.map((i,el)=>$(el).val())
									.toArray();
							default:
								return $bindingEl.val();
						}
					})();
					console.log('binding change',val,e);
					model.set(property,val);
				};
				$bindingEl.on(`input`,changeCb);
				$bindingEl.on(`paste`,changeCb);
				$bindingEl.on(`change`,changeCb);

				break;

			default:
				model.on(`change:${property}`,(m,value,opts)=>{
					$(el).html(value);
				});
		}
	});
}