/**
 *
 * @param $el JQuery - jquery элемент, внутри которого искать элементы, к которым биндиться
 * @param attrName String - имя атрибута, по которому искать
 * @param model Backbone.Model - модель, к которой биндиться по значению указанного атрибута {attrName}
 */
export function initBindings ($el,attrName,model) {
	if (initBindings.called) return;
	initBindings.called = true;

	const $allBindings = $el.find(`[${attrName}]`);

	$allBindings.each((i,el)=>{
		const $bindingEl = $(el);
		const bindPropertyName = $bindingEl.attr(attrName);

		switch ($bindingEl.prop('nodeName')) {
			case "INPUT":
			case "TEXTAREA":

				/*	MODEL -> UI */

				model.on(`change:${bindPropertyName}`,(m,value=null,opts)=>{
					switch ($bindingEl.prop('type')) {
						case 'radio':
							/* взять все с именем текущего,
							 * вырубить все
							 * включить только те, у которых value совпадает с тем, что в модели
							 */
							$allBindings
								.filter((i,el)=>$(el).prop('name') === $bindingEl.prop('name'))
								.each((i,el)=>$(el).prop('checked',false))
								.filter((i,el)=>$(el).val() == value)
								.each((i,el)=>$(el).prop('checked',true));
							break;
						case 'checkbox':
							/* взять все с именем текущего,
							 * выбрать все те, value которых есть в массиве значений в модели
							 */
							$allBindings
								.filter((i,el)=>$(el).prop('name') === $bindingEl.prop('name'))
								.each((i,el)=>$(el).prop('checked',value.includes && value.includes(el.value)));
							break;
						default:
							$bindingEl.val(value);
					}
				});


				/*	UI -> MODEL */

				const changeCb = (e)=>{
					const val = (()=>{
						switch ($bindingEl.prop('type')) {
							case "checkbox":
								/* собрать массив из value всех выбранных чекбоксов с таким же именем, как у текущего */
								return $allBindings
									.filter((i,el)=>{
										return $(el).prop('name') === $bindingEl.prop('name') && $(el).prop('checked')
									})
									.map((i,el)=>$(el).val())
									.toArray();
							default:
								/* у всех остальных можно просто взять .val() */
								return $bindingEl.val();
						}
					})();
					console.log('binding change',val,e);
					model.set(bindPropertyName,val);
				};
				$bindingEl.on(`input.bindings`,changeCb);
				$bindingEl.on(`paste.bindings`,changeCb);
				$bindingEl.on(`change.bindings`,changeCb);

				break;

			default:
				model.on(`change:${bindPropertyName}`,(m,value,opts)=>{
					$(el).text(value);
				});
		}
	});
}