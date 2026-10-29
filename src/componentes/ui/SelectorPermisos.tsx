// Lista de permisos con casillas, agrupados. Las casillas marcadas viajan como «permisos».
type Permiso = { clave: string; etiqueta: string; grupo: string }

export function SelectorPermisos({ catalogo, marcados = [], prefijoId }: { catalogo: Permiso[]; marcados?: string[]; prefijoId: string }) {
  const grupos = Array.from(new Set(catalogo.map((p) => p.grupo)))
  const activos = new Set(marcados)
  return (
    <div>
      {grupos.map((g) => (
        <fieldset key={g} className="grupo-permisos">
          <legend>{g}</legend>
          {catalogo.filter((p) => p.grupo === g).map((p) => {
            const id = `${prefijoId}-${p.clave}`
            return (
              <div className="opcion" key={p.clave}>
                <input type="checkbox" id={id} name="permisos" value={p.clave} defaultChecked={activos.has(p.clave)} data-testid={`permiso-${prefijoId}-${p.clave}`} />
                <label htmlFor={id}>{p.etiqueta} <span className="suave cod">({p.clave})</span></label>
              </div>
            )
          })}
        </fieldset>
      ))}
    </div>
  )
}
